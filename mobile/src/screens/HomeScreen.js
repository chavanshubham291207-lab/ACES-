import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ percentage: 0, myAttended: 0, totalSessions: 0 });
  const [records, setRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      const res = await API.get('/attendance/my-history');
      if (res.data.success) {
        setStats(res.data.stats || {});
        setRecords(res.data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} tintColor="#38BDF8" />}
    >
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeTitle}>Hello, {user?.name} 👋</Text>
          <Text style={styles.welcomeSub}>{user?.rollNumber} • {user?.department}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Scan Button */}
      <TouchableOpacity style={styles.scanCard} onPress={() => navigation.navigate('Scan')}>
        <View style={styles.scanIconBox}>
          <Text style={styles.scanIconText}>📷</Text>
        </View>
        <View style={styles.scanTextBox}>
          <Text style={styles.scanTitle}>Scan Attendance QR</Text>
          <Text style={styles.scanSub}>Point camera at session QR code to check in</Text>
        </View>
      </TouchableOpacity>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Turnout Rate</Text>
          <Text style={styles.metricValue}>{stats.percentage || 0}%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Sessions</Text>
          <Text style={styles.metricValue}>{stats.myAttended || 0}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Points</Text>
          <Text style={[styles.metricValue, { color: '#F59E0B' }]}>{user?.contributionPoints || 0}</Text>
        </View>
      </View>

      {/* Recent History Section */}
      <Text style={styles.sectionTitle}>Recent Attendance Logs</Text>

      {records.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Attendance Records</Text>
          <Text style={styles.emptySub}>Scan an active session QR code to record attendance.</Text>
        </View>
      ) : (
        records.slice(0, 5).map((item) => (
          <View key={item._id} style={styles.historyCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyTitle}>{item.meetingTitle || item.session?.meetingTitle}</Text>
              <Text style={styles.historyTime}>{item.date} • {item.checkInTime}</Text>
            </View>
            <View style={[styles.badge, item.status === 'Present' ? styles.badgePresent : styles.badgeLate]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
        ))
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  welcomeSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  logoutText: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '700',
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  scanIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scanIconText: {
    fontSize: 24,
  },
  scanTextBox: {
    flex: 1,
  },
  scanTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  scanSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#38BDF8',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyBox: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  historyTime: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePresent: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeLate: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  badgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
});
