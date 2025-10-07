import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';

// Usa la IP LAN que te salió en ipconfig
// const API_URL = 'http://192.168.100.55:3000';
const API_URL = 'http://localhost:3000'; // cambia por tu IP si usas Expo Go en celular
console.log('[API_URL]', API_URL);


//10.186.6.138
//const API_URL = 'http://10.186.6.138:3000';
console.log('[API_URL]', API_URL);

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallScreen = height <= 667;

export default function LoginScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!usuario.trim() || !contrasenia.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu usuario y contraseña.');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasenia }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.message || 'Credenciales inválidas');

      router.replace('/(tabs)/citas');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}></Text>
          <Text style={styles.appName}>Consultorio Médico</Text>
        </View>
        <Text style={styles.welcomeText}>Bienvenido</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Ingresa a tu cuenta</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            placeholder="Ingresa tu usuario"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            value={usuario}
            onChangeText={setUsuario}
            style={styles.input}
            returnKeyType="next"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordRow}>
            <TextInput
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!mostrar}
              value={contrasenia}
              onChangeText={setContrasenia}
              style={[styles.input, styles.passwordInput]}
              returnKeyType="done"
              onSubmitEditing={onLogin}
            />
            <TouchableOpacity onPress={() => setMostrar(v => !v)} style={styles.showBtn}>
              <Text style={styles.showBtnText}>{mostrar ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          onPress={onLogin} 
          style={[styles.btn, loading && styles.btnDisabled]} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" style={styles.link}>
              Regístrate aquí
            </Link>
          </Text>
        </View>
      </View>

      {/* Footer de la página */}
      <View style={styles.pageFooter}>
        <Text style={styles.copyright}>© 2024 Consultorio Médico. Todos los derechos reservados.</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 20 : 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    fontSize: isTablet ? 32 : 28,
    marginRight: 10,
  },
  appName: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    color: '#1E40AF',
  },
  welcomeText: {
    fontSize: isTablet ? 18 : 16,
    color: '#6B7280',
    fontWeight: '500',
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
  passwordInput: {
    paddingRight: 50,
  },
  passwordRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    position: 'relative' 
  },
  showBtn: { 
    position: 'absolute',
    right: 8,
    paddingHorizontal: 8,
    height: 36,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  showBtnText: { 
    fontSize: 16,
  },
  btn: { 
    height: 52, 
    backgroundColor: '#1E40AF', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 12,
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
  link: {
    color: '#1E40AF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  pageFooter: {
    marginTop: isSmallScreen ? 20 : 30,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});