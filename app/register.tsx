import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';

// Usa la IP LAN que te salió en ipconfig
// const API_URL = 'http://192.168.100.55:3000';
const API_URL = 'http://localhost:3000'; // cambia por tu IP si usas Expo Go en celular

console.log('[API_URL]', API_URL);

//const API_URL = 'http://10.186.6.138:3000';
console.log('[API_URL]', API_URL);

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallScreen = height <= 667;

export default function RegisterScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [tipo, setTipo] = useState('2');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!usuario.trim() || !contrasenia.trim()) {
      Alert.alert('Campos requeridos', 'Completa usuario y contraseña.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasenia, tipo: Number(tipo) }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.message || 'No se pudo registrar');

      Alert.alert('Éxito', 'Registro exitoso. Inicia sesión.');
      router.replace('/login');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput 
            placeholder="Ingresa tu usuario" 
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none" 
            value={usuario} 
            onChangeText={setUsuario} 
            style={styles.input} 
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput 
            placeholder="Crea tu contraseña" 
            placeholderTextColor="#9CA3AF"
            secureTextEntry 
            value={contrasenia} 
            onChangeText={setContrasenia} 
            style={styles.input} 
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tipo de usuario</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity 
              style={[styles.radioButton, tipo === '1' && styles.radioButtonSelected]} 
              onPress={() => setTipo('1')}
            >
              <Text style={[styles.radioText, tipo === '1' && styles.radioTextSelected]}>Administrador (1)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.radioButton, tipo === '2' && styles.radioButtonSelected]} 
              onPress={() => setTipo('2')}
            >
              <Text style={[styles.radioText, tipo === '2' && styles.radioTextSelected]}>Usuario Normal (2)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          onPress={onRegister} 
          style={[styles.btn, loading && styles.btnDisabled]} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Registrarme</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" asChild>
              <Text style={styles.linkText}>Inicia sesión</Text>
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    paddingHorizontal: isTablet ? 40 : 24, 
    paddingVertical: isSmallScreen ? 20 : 40,
    justifyContent: 'center' 
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: isTablet ? 32 : 24, 
    gap: 20, 
    shadowColor: '#000',
    shadowOpacity: 0.08, 
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 6, 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: { 
    fontSize: isTablet ? 28 : 24, 
    fontWeight: '700', 
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 8,
  },
  field: { 
    gap: 8 
  },
  label: { 
    fontSize: 14, 
    color: '#374151', 
    fontWeight: '600',
    marginLeft: 4,
  },
  input: { 
    height: 52, 
    borderWidth: 1.5, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#1E40AF',
    backgroundColor: '#E0E7FF',
  },
  radioText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  btn: { 
    height: 52, 
    backgroundColor: '#1E40AF', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 8,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700', 
    letterSpacing: 0.5 
  },
  footer: {
    alignItems: 'center', 
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkText: {
    color: '#1E40AF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});