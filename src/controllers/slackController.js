import { slackClient } from "../../index.js";

//1. send messages
export const sendMessage = async (req, res) => {
    try {
        const { channel, text } = req.body;

         // Validations
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Message text is required"
            });
        }

          if (text.length > 2000) {
            return res.status(400).json({
                success: false,
                error: "Message text cannot exceed 40,000 characters"
            });
        }

        const result = await slackClient.chat.postMessage({
            channel: channel || process.env.SLACK_CHANNEL_ID,
            text: text
        });

        res.status(200).json({
            success: true,
            message: "Message sent successfully",
            data: {
                text: result.message.text,
                bot_id: result.message.bot_id,
                channel_id: result.channel,
                userId: result.message.user
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

// Helper function to format relative time
function getTimeUntil(unixTimestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diffSeconds = unixTimestamp - now;
    
    // Convert to minutes, hours, days
    const minutes = Math.floor(diffSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Helper function to format units with proper pluralization
    const formatUnit = (value, unit) => 
        value > 0 ? `${value} ${unit}${value !== 1 ? 's' : ''}` : '';

    // Format the time components
    if (days > 0) {
        const remainingHours = hours % 24;
        return `in ${formatUnit(days, 'day')} and ${formatUnit(remainingHours, 'hour')}`;
    }
    
    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return `in ${formatUnit(hours, 'hour')} and ${formatUnit(remainingMinutes, 'minute')}`;
    }
    
    return `in ${formatUnit(minutes, 'minute')}`;
}

// 2.scheduled messages with relative time support
export const Shedule_Message = async (req, res) => {
    try {
        const { channel, text, post_at, scheduled_time, delay_minutes, delay_hours } = req.body;

        let unixTimestamp;
        let scheduleMethod = "unknown";

          // Validations
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Message text is required"
            });
        }

          if (text.length > 2000) {
            return res.status(400).json({
                success: false,
                error: "Message text cannot exceed 40,000 characters"
            });
        }

        // Method 1: Direct unix timestamp
        if (post_at) {
            unixTimestamp = post_at;
            scheduleMethod = "unix_timestamp";
        }
        // Method 2: Human-readable date string
        else if (scheduled_time) {
            const scheduledDate = new Date(scheduled_time);

            if (isNaN(scheduledDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid date format",
                    examples: [
                        "2024-10-05 15:30:00",
                        "October 5, 2024 3:30 PM",
                        "2024-10-05T15:30:00"
                    ]
                });
            }

            const now = new Date();
            if (scheduledDate <= now) {
                return res.status(400).json({
                    success: false,
                    error: `Scheduled time must be in the future. Current time: ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
                });
            }

            unixTimestamp = Math.floor(scheduledDate.getTime() / 1000);
            scheduleMethod = "absolute_time";
        }
        // Method 3: Relative time - minutes
        else if (delay_minutes) {
            const now = Date.now();
            const futureTime = now + (delay_minutes * 60 * 1000);
            unixTimestamp = Math.floor(futureTime / 1000);
            scheduleMethod = "relative_minutes";
        }
        // Method 4: Relative time - hours
        else if (delay_hours) {
            const now = Date.now();
            const futureTime = now + (delay_hours * 60 * 60 * 1000);
            unixTimestamp = Math.floor(futureTime / 1000);
            scheduleMethod = "relative_hours";
        }
        else {
            return res.status(400).json({
                success: false,
                error: "Please provide scheduling time",
                accepted_formats: {
                    unix_timestamp: "post_at: 1728132600",
                    absolute_time: "scheduled_time: '2024-10-05 15:30:00'",
                    relative_minutes: "delay_minutes: 30",
                    relative_hours: "delay_hours: 2"
                }
            });
        }

        // Slack requires future time (at least 1 minute from now)
        const currentUnix = Math.floor(Date.now() / 1000);
        if (unixTimestamp <= currentUnix + 60) {
            return res.status(400).json({
                success: false,
                error: "Scheduled time must be at least 1 minute in the future"
            });
        }

        const scheduled_message = await slackClient.chat.scheduleMessage({
            channel: channel || process.env.SLACK_CHANNEL_ID,
            text: text,
            post_at: unixTimestamp
        });

        const readableTime = new Date(unixTimestamp * 1000).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        res.status(200).json({
            success: true,
            message: "Message scheduled successfully",
            schedule_method: scheduleMethod,
            scheduled_for: {
                unix_timestamp: unixTimestamp,
                readable_time: readableTime,
                time_until: getTimeUntil(unixTimestamp)
            },
            data: scheduled_message
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

//3. get messages (retieve)
export const Get_Messages = async (req, res) => {
    try {
        const { channel, messageId } = req.params;

        // Validations
        if (!channel) {
            return res.status(400).json({
                success: false,
                error: "Channel ID is required"
            });
        }

        const result = await slackClient.conversations.history({
            channel: channel || process.env.SLACK_CHANNEL_ID,
            messageId: messageId,
            limit: 10
        });

        res.status(200).json({
            success: true,
            message: "Message fetched successfully",
            data: result.messages.map(msg => ({
                text: msg.text,
                timestamp: msg.ts,
                user: msg.user,
                bot_id: msg.bot_id,
                type: msg.type,
                subtype: msg.subtype
            }))
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// 4. Edit messages
export const Edit_Messages = async (req, res) => {
    try {
        const { channel, ts, text } = req.body;

         // Validations
        if (!channel || !ts || !text) {
            return res.status(400).json({
                success: false,
                error: "Channel ID, timestamp, and text are required"
            });
        }

        if (text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Message text cannot be empty"
            });
        }

        if (text.length > 2000) {
            return res.status(400).json({
                success: false,
                error: "Message text cannot exceed 40,000 characters"
            });
        }

        const edit_messages = await slackClient.chat.update({
            channel: channel || process.env.SLACK_CHANNEL_ID,
            ts: ts,
            text: text
        });

        res.status(201).json({
            success: true,
            message: "Message updated successfully",
            data: {
                channel: edit_messages.channel,
                timestamp: edit_messages.ts,
                updated_text: edit_messages.text
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Delete message
export const Delete_Message = async (req, res) => {
    try {
        const { channel, ts } = req.body;

         // Validations
        if (!channel || !ts) {
            return res.status(400).json({
                success: false,
                error: "Channel ID and timestamp are required"
            });
        }

        const delete_message = await slackClient.chat.delete({
            channel: channel || process.env.SLACK_CHANNEL_ID,
            ts: ts
        });

        res.status(200).json({
            success: true,
            message: "Message deleted successfully",
            data: {
                channel: delete_message.channel,
                message: delete_message.message,
                timestamp: delete_message.ts
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// 6. List Channels
export const List_Channels = async (req, res) => {
    try {
        const list_channels = await slackClient.conversations.list();

        if(!list_channels) return res.status(404).json({
            success: false,
            message: "No channel Found"
        })
        res.status(200).json({
            success: true,
            channels: {
            total_channels: list_channels.channels.length,
            channels: list_channels.channels.map(ch => ({
                id: ch.id,
                name: ch.name,
                is_private: ch.is_private,
                is_member: ch.is_member,
                num_members: ch.num_members,
                created: new Date(ch.created * 1000).toLocaleString('en-IN', { 
                    timeZone: 'Asia/Kolkata' 
                })
            }))
        }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}