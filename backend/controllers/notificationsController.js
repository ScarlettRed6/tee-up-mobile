import {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../models/notificationsModel.js";

function parseNotificationDataRaw(data) {
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        } catch {
            return {};
        }
    }
    if (!data || typeof data !== "object") return {};
    return data;
}

/** Drop rows where the recipient is effectively the actor (e.g. legacy self-favorites). */
function isSelfDirectedNotification(notification, recipientUserId) {
    const rid = Number(recipientUserId);
    const data = parseNotificationDataRaw(notification.data);

    if (notification.type === "listing_favorited") {
        const actorId = data.favorited_user_id ?? data.favorited_by;
        if (actorId != null && Number(actorId) === rid) return true;
    }

    if (notification.type === "favorite_status_changed") {
        const sellerId = data.seller_id;
        if (sellerId != null && Number(sellerId) === rid) return true;
    }

    if (notification.type === "followed_new_listing") {
        const sellerId = data.seller_id;
        if (sellerId != null && Number(sellerId) === rid) return true;
    }

    if (notification.type === "new_follower") {
        const followerId = data.follower_id;
        if (followerId != null && Number(followerId) === rid) return true;
    }

    return false;
}

export async function listNotifications(req, res) {
    try {
        const user_id = req.user.id;
        const notifications = await getUserNotifications(user_id);
        const filtered = notifications.filter(
            (n) => !isSelfDirectedNotification(n, user_id)
        );

        const transformed = filtered.map((notification) => {
            let parsedData = notification.data;
            if (typeof parsedData === "string") {
                try {
                    parsedData = JSON.parse(parsedData);
                } catch (err) {
                    parsedData = {};
                }
            } else if (!parsedData || typeof parsedData !== "object") {
                parsedData = {};
            }

            const notificationId = notification.notification_id || notification.id;

            if (notification.type === "listing_favorited") {
                const favoritedBy = parsedData?.favorited_user_name || parsedData?.favorited_by_name;
                const listingTitle = parsedData?.listing_title || parsedData?.listingTitle;
                const listingId = parsedData?.listing_id || parsedData?.listingId;
                const favoritingUserId = parsedData?.favorited_user_id || parsedData?.favoriting_user_id || parsedData?.favorited_by;

                const parts = [];
                if (favoritedBy) {
                    parts.push(`${favoritedBy} favorited`);
                } else {
                    parts.push("Someone favorited");
                }
                parts.push("your listing");
                if (listingTitle) {
                    parts.push(`"${listingTitle}"`);
                }

                return {
                    ...notification,
                    notification_id: notificationId,
                    message: parts.join(" "),
                    data: {
                        ...parsedData,
                        listing_id: listingId,
                        favorited_user_id: favoritingUserId,
                    },
                };
            }

            if (notification.type === "favorite_sold") {
                const listingTitle = parsedData?.listing_title || parsedData?.listingTitle;
                const listingId = parsedData?.listing_id || parsedData?.listingId;
                const sellerName = parsedData?.seller_name || parsedData?.sellerName || "Someone";
                const message = `${sellerName} has marked the listing${listingTitle ? ` "${listingTitle}"` : ''} as Sold.`;

                return {
                    ...notification,
                    notification_id: notificationId,
                    message,
                    data: {
                        ...parsedData,
                        listing_id: listingId,
                        listing_title: listingTitle,
                        seller_name: sellerName,
                        status: 'Sold',
                    },
                };
            }

            if (notification.type === "favorite_status_changed") {
                const listingTitle = parsedData?.listing_title || parsedData?.listingTitle;
                const listingId = parsedData?.listing_id || parsedData?.listingId;
                const sellerName = parsedData?.seller_name || parsedData?.sellerName || "Someone";
                const statusLabel = parsedData?.status || parsedData?.listing_status || "Updated";

                const message = `${sellerName} has marked the listing${listingTitle ? ` "${listingTitle}"` : ''} as ${statusLabel}.`;

                return {
                    ...notification,
                    notification_id: notificationId,
                    message,
                    data: {
                        ...parsedData,
                        listing_id: listingId,
                        listing_title: listingTitle,
                        status: statusLabel,
                        seller_name: sellerName,
                    },
                };
            }

            if (notification.type === "new_follower") {
                const followerName = parsedData?.follower_name || "Someone";
                const followerId = parsedData?.follower_id;
                const message = `${followerName} just followed you.`;

                return {
                    ...notification,
                    notification_id: notificationId,
                    message,
                    data: {
                        ...parsedData,
                        follower_id: followerId,
                        follower_name: followerName,
                    },
                };
            }

            if (notification.type === "followed_new_listing") {
                const sellerName = parsedData?.seller_name || parsedData?.sellerName || "Someone";
                const listingTitle = parsedData?.listing_title || parsedData?.listingTitle;
                const listingId = parsedData?.listing_id || parsedData?.listingId;

                const segments = [`${sellerName} posted a new listing`];
                if (listingTitle) {
                    segments.push(`"${listingTitle}"`);
                }

                return {
                    ...notification,
                    notification_id: notificationId,
                    message: segments.join(" "),
                    data: {
                        ...parsedData,
                        listing_id: listingId,
                    },
                };
            }

            if (notification.type === "new_message") {
                const conversationId =
                    parsedData?.conversationId ?? parsedData?.conversation_id;
                return {
                    ...notification,
                    notification_id: notificationId,
                    data: {
                        ...parsedData,
                        conversationId,
                    },
                };
            }

            if (notification.type === "rating_received") {
                return {
                    ...notification,
                    notification_id: notificationId,
                    data: parsedData,
                };
            }

            return {
                ...notification,
                notification_id: notificationId,
                data: parsedData,
            };
        });

        res.json({ message: "Fetched notifications successfully", notifications: transformed });
    } catch (err) {
        console.error("listNotifications error:", err);
        res.status(500).json({ error: err.message });
    }
}

export async function markNotificationAsRead(req, res) {
    try {
        const user_id = req.user.id;
        const { notification_id } = req.params;

        const updated = await markNotificationRead(notification_id, user_id);
        if (!updated) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json({ message: "Notification marked as read", notification: updated });
    } catch (err) {
        console.error("markNotificationAsRead error:", err);
        res.status(500).json({ error: err.message });
    }
}

export async function markAllNotificationsAsRead(req, res) {
    try {
        const user_id = req.user.id;
        const updated = await markAllNotificationsRead(user_id);
        res.json({ message: "All notifications marked as read", updated });
    } catch (err) {
        console.error("markAllNotificationsAsRead error:", err);
        res.status(500).json({ error: err.message });
    }
}

