import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatBox = ({ title, count, total, color }) => {
    const safeCount = typeof count === 'number' ? count : 0;
    const safeTotal = typeof total === 'number' && total > 0 ? total : 1;
    const percentage = Math.round((safeCount / safeTotal) * 100);

    return (
        <View style={styles.container}>
            <View style={[styles.colorBar, { backgroundColor: color || '#10b981' }]} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.count}>
                <Text style={styles.countNumber}>{safeCount}</Text>
                <Text style={styles.countTotal}>/{safeTotal}</Text>
            </Text>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: percentage + '%', backgroundColor: color || '#10b981' }]} />
            </View>
            <Text style={styles.percentage}>{percentage}% opted in</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1f1f3a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    colorBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    title: {
        color: '#888',
        fontSize: 12,
        marginBottom: 8,
        marginTop: 4,
    },
    count: {
        marginBottom: 8,
    },
    countNumber: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    countTotal: {
        color: '#666',
        fontSize: 16,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    percentage: {
        color: '#666',
        fontSize: 11,
        marginTop: 4,
    },
});

export default StatBox;
