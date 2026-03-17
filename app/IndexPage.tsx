import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ToastAndroid,
    TouchableWithoutFeedback,
    Keyboard,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import Feather from "react-native-vector-icons/Feather";

const IndexPage = () => {
    const route = useRouter();
    const BASEURL = "https://authenticator-backend-h4al.onrender.com";
    // const BASEURL = "http://10.76.238.54:8080";
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [register, setRegister] = useState(false);
    const [loading,setLoading] = useState(false);

    useEffect(() => {
        const check = async () => {
            const id = await SecureStore.getItemAsync("UserId");
            if (id != null) {
                route.replace("/(tabs)/HomePage");
            }
        }
        check();
    }, []);

    const handleLogin = async () => {
        try {
            const res = await fetch(`${BASEURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: name,
                    password: password
                })
            });
            if (res.ok) {
                const result = await res.json();
                console.log(JSON.stringify(result));
                await SecureStore.setItemAsync("UserId", String(result.userId));
                await SecureStore.setItemAsync("Email", result.email);
                ToastAndroid.show("Login Successful", ToastAndroid.SHORT);
                route.replace("/(tabs)/HomePage");
            }
            else {
                const result = await res.json();
                ToastAndroid.show(result.message, ToastAndroid.SHORT);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleRegister = async () => {
        try {
            const res = await fetch(`${BASEURL}/save-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: name,
                    password: password
                })
            });
            if (res.ok) {
                ToastAndroid.show("Registration Successful", ToastAndroid.SHORT);
                route.replace("/(tabs)/HomePage");
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
       <SafeAreaView style={styles.container}>
            <StatusBar barStyle="default" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>
                        {/* Logo/Icon Section */}
                        <View style={styles.logoContainer}>
                            <View style={styles.iconCircle}>
                                <Feather name="shield" size={50} color="#007AFF" />
                            </View>
                            <Text style={styles.title}>
                                {register ? "Create Account" : "Secure Login"}
                            </Text>
                            <Text style={styles.subtitle}>
                                {register ? "Start protecting your accounts" : "Enter your credentials to continue"}
                            </Text>
                        </View>

                        {/* Input Section */}
                        <View style={styles.form}>
                            <View style={styles.inputWrapper}>
                                <Feather name="mail" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Email Address"
                                    placeholderTextColor="#666"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Feather name="lock" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Password"
                                    placeholderTextColor="#666"
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity 
                                style={[styles.button, loading && styles.buttonDisabled]} 
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        {register ? "Sign Up" : "Sign In"}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.toggleContainer}
                                onPress={() => setRegister(!register)}
                            >
                                <Text style={styles.toggleText}>
                                    {register ? "Already have an account? " : "Don't have an account? "}
                                    <Text style={styles.toggleLink}>
                                        {register ? "Log In" : "Register"}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F', // Deeper black
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        marginTop: 8,
    },
    form: {
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 15,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        paddingVertical: 18,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 15,
        paddingVertical: 18,
        marginTop: 10,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#004499',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    toggleContainer: {
        marginTop: 25,
        alignItems: 'center',
    },
    toggleText: {
        color: '#888',
        fontSize: 14,
    },
    toggleLink: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
});

export default IndexPage;