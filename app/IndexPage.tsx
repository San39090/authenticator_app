import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
    Pressable
} from 'react-native';

const IndexPage = () => {
    const route = useRouter();
    const BASEURL = "https://authenticator-backend-h4al.onrender.com";
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [register,setRegister] = useState(false);
    let toggle = false;

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
                ToastAndroid.show("Login Successful", ToastAndroid.SHORT);
                route.replace("/(tabs)/HomePage");
            }
            else{
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
            {/* Makes the status bar icons white */}
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome {register?"":"Back"}</Text>
                    <Text style={styles.subtitle}>{register?"Register":"Login"} to access your 2FA codes</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email or Username</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter password"
                            placeholderTextColor="#666"
                            secureTextEntry // Hides the password
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={register?handleRegister:handleLogin} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>{register?"Register":"Login"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{setRegister(toggle);toggle = !toggle}}>
                        <Text style={[styles.subtitle,styles.register]}>{register?"Already have an account? Login here":"Register Here"}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Dark background
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    register:{
        textAlign:'center',
        marginTop:20
    },
    subtitle: {
        fontSize: 16,
        color: '#AAAAAA',
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#BBBBBB',
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    button: {
        backgroundColor: '#007AFF', // Professional Blue
        borderRadius: 12,
        paddingVertical: 18,
        marginTop: 20,
        alignItems: 'center',
        // Shadow for iOS
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        // Elevation for Android
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default IndexPage;