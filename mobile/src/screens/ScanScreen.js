import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import API from '../services/api';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator color="#2563EB" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission is required to scan QR codes.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleVerifyQR = async (data) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    try {
      const rawToken = data.includes('/') ? data.split('/').pop() : data;
      const res = await API.get(`/attendance/verify-qr/${rawToken.trim()}`);
      
      if (res.data.success) {
        // Navigate to Confirmation Screen (DO NOT submit immediately)
        navigation.navigate('Confirmation', { confirmationData: res.data.confirmationData });
      }
    } catch (err) {
      Alert.alert(
        'Scan Error',
        err.response?.data?.message || 'Invalid or expired QR code.',
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : ({ data }) => handleVerifyQR(data)}
      />

      {/* Overlay Mask */}
      <View style={styles.overlay}>
        <Text style={styles.instruction}>Align QR code within the frame</Text>
        <View style={styles.qrBox} />
        {loading && <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 20 }} />}
      </View>

      {/* Manual Fallback Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Or enter session code manually:</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="ACES-QR-XXXXXXXX"
            placeholderTextColor="#64748B"
            value={manualCode}
            onChangeText={setManualCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => handleVerifyQR(manualCode)}
            disabled={!manualCode || loading}
          >
            <Text style={styles.btnText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  center: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  qrBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  footer: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  footerLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 10,
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
