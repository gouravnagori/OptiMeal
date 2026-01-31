import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

const MealCard = ({ type, time, isSelected, onToggle, isLocked, menuItems, deadline }) => {
    const getMealEmoji = () => {
        switch (type) {
            case 'breakfast': return '🌅';
            case 'lunch': return '☀️';
            case 'highTea': return '🍵';
            case 'dinner': return '🌙';
            default: return '🍽️';
        }
    };

    const getMealName = () => {
        return type === 'highTea' ? 'High Tea' : type.charAt(0).toUpperCase() + type.slice(1);
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;
        const h = parseInt(parts[0], 10);
        const mins = parts[1];
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return hour12 + ':' + mins + ' ' + ampm;
    };

    const items = menuItems || [];
    const selected = isSelected === true;
    const locked = isLocked === true;

    const handleToggle = () => {
        if (!locked && onToggle) {
            onToggle();
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, locked ? styles.lockedCard : null]}
            onPress={handleToggle}
            activeOpacity={locked ? 1 : 0.8}
        >
            {locked && (
                <View style={styles.lockedOverlay}>
                    <Text style={styles.lockedIcon}>🔒</Text>
                    <Text style={styles.lockedText}>Locked</Text>
                    {deadline ? <Text style={styles.deadlineText}>Closed at {formatTime(deadline)}</Text> : null}
                </View>
            )}

            <View style={styles.header}>
                <Text style={styles.emoji}>{getMealEmoji()}</Text>
                <Switch
                    value={selected}
                    onValueChange={handleToggle}
                    trackColor={{ false: '#333', true: '#10b981' }}
                    thumbColor={selected ? '#fff' : '#666'}
                    disabled={locked}
                />
            </View>

            <Text style={styles.mealName}>{getMealName()}</Text>
            <Text style={styles.time}>{time}</Text>

            {deadline && !locked ? (
                <Text style={styles.deadline}>🔒 Request by {formatTime(deadline)}</Text>
            ) : null}

            {items.length > 0 ? (
                <View style={styles.menuContainer}>
                    {items.slice(0, 2).map((item, idx) => (
                        <Text key={idx} style={styles.menuItem}>• {item}</Text>
                    ))}
                    {items.length > 2 ? (
                        <Text style={styles.menuMore}>+{items.length - 2} more</Text>
                    ) : null}
                </View>
            ) : null}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1f1f3a',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
        position: 'relative',
    },
    lockedCard: {
        opacity: 0.7,
    },
    lockedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    lockedIcon: {
        fontSize: 32,
    },
    lockedText: {
        color: '#ef4444',
        fontWeight: 'bold',
        marginTop: 8,
    },
    deadlineText: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    emoji: {
        fontSize: 32,
    },
    mealName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    time: {
        color: '#666',
        fontSize: 14,
        marginTop: 4,
    },
    deadline: {
        color: '#f59e0b',
        fontSize: 12,
        marginTop: 8,
    },
    menuContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    menuItem: {
        color: '#888',
        fontSize: 12,
        marginBottom: 2,
    },
    menuMore: {
        color: '#10b981',
        fontSize: 12,
        marginTop: 4,
    },
});

export default MealCard;
