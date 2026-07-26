import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import API from '../services/api';

export default function ConfirmationScreen({ route, navigation }) {
  const { confirmationData } = route.params || {};
  const [remarks, setRemarks] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!confirmationData) {
    navigation.goBack();
    return null;
  }

  const handleSubmitAttendance = async () => {
    if (!confirmed) {
      Alert.alert('Required', 'Please check the confirmation box before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/attendance/submit', {
        qrToken: confirmationData.qrToken,
        sessionId: confirmationData.sessionId,
        remarks
      });

      if (res.data.success) {
        Alert.alert(
          'Success!',
          res.data.message || '✅ Attendance marked successfully.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      }
    } catch (err) {
      Alert.alert(
        'Submission Failed',
        err.response?.data?.message || 'Failed to submit attendance.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        
        {/* Header Badge */}
        <View style={styles.badgeBox}>
          <Text style={styles.badgeText}>🛡️ Attendance Confirmation</Text>
        </View>
        <Text style={styles.title}>Confirm Your Details</Text>
        <Text style={styles.subtitle}>Auto-filled from your MongoDB account</Text>

        {/* Read Only Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.gridItem}>
            <Text style={styles.itemLabel}>👤 MEMBER NAME</Text>
            <Text style={styles.itemValue}>{confirmationData.memberName}</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.itemLabel}>👥 ASSIGNED TEAM</Text>
            <Text style={[styles.itemValue, { color: '#38BDF8' }]}>{confirmationData.memberTeam}</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.itemLabel}>🏷 POSITION</Text>
            <Text style={[styles.itemValue, { color: '#818CF8' }]}>{confirmationData.memberPosition}</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.itemLabel}>📅 DATE</Text>
            <Text style={styles.itemValue}>{confirmationData.date}</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.itemLabel}>🕒 TIME</Text>
            <Text style={styles.itemValue}>{confirmationData.checkInTime}</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.itemLabel}>📍 VENUE</Text>
            <Text style={styles.itemValue}>{confirmationData.venue}</Text>
          </View>

          <View style={styles.fullWidthItem}>
            <Text style={styles.itemLabel}>📚 MEETING TITLE</Text>
            <Text style={styles.meetingTitle}>{confirmationData.meetingTitle}</Text>
            <Text style={styles.meetingType}>({confirmationData.meetingType})</Text>
          </View>
        </View>

        {/* Optional Remarks */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📝 Optional Remarks</Text>
          <TextInput
            style={styles.input}
            placeholder="Add optional notes..."
            placeholderTextColor="#64748B"
            value={remarks}
            onChangeText={setRemarks}
          />
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setConfirmed(!confirmed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
            {confirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>I confirm my attendance for this session</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, (!confirmed || submitting) && styles.disabledBtn]}
            onPress={handleSubmitAttendance}
            disabled={!confirmed || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Submit Attendance</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
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
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeBox: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    gap: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gridItem: {
    width: '45%',
  },
  fullWidthItem: {
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  meetingType: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  checkboxLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
