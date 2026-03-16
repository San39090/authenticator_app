import { useRouter } from "expo-router";
import { generateSync } from "otplib";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import * as SecureStore from 'expo-secure-store';

const AddCode = () => {
    const router = useRouter();
    const [issuer, setIssuer] = useState("");
    const [code, setCode] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const BASEURL = "http://10.76.238.54:8080";

    useEffect(()=>{
        const getEmail = async() => {
            const res = await SecureStore.getItemAsync("Email");
            setUserEmail(res||"");
        } 
        getEmail();
    },[]);

    const handleCodeEntered = async () => {
        const cleanCode = code.replace(/\s/g, '').toUpperCase();
        if (!cleanCode) {
            ToastAndroid.show("Please enter correct code", ToastAndroid.SHORT);
            return;
        }
        try {
            const res = await fetch(`${BASEURL}/save/secret`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: cleanCode,
                    issuer: issuer,
                    account: userEmail
                })
            });
            if (res.ok) {
                ToastAndroid.show(`${issuer} added successfully`, ToastAndroid.SHORT);
                router.back();
            }
            else {
                ToastAndroid.show(`Error adding ${issuer}. Please check your internet connection`, ToastAndroid.SHORT)
            }
            // const initialCode = generateSync({
            //     secret: cleanCode || "",
            // });
            // const newEntry = {
            //     id: Date.now().toString(),
            //     secret: cleanCode,
            //     issuer: issuer,
            //     account: userEmail,
            //     code: initialCode
            // }
            // setOtpList((prev: any) => [...prev, newEntry]);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Enter setup key</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.description}>
                        Type the account name and the secret key provided by the website.
                    </Text>

                    {/* Account Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Account Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. GitHub: User"
                            placeholderTextColor="#999"
                            value={issuer}
                            onChangeText={setIssuer}
                        />
                    </View>

                    {/* Secret Key Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Your Key</Text>
                        <TextInput
                            style={[styles.input, styles.keyInput]}
                            placeholder="Type the secret key"
                            placeholderTextColor="#999"
                            value={code}
                            onChangeText={setCode}
                            autoCapitalize="characters"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity 
                        style={styles.submitButton} 
                        onPress={handleCodeEntered}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitText}>Add Account</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
    },
    form: {
        flex: 1,
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        height: 55,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#F9F9F9',
    },
    keyInput: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Monospace for keys
        letterSpacing: 1,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#007AFF',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 5,
    },
    submitText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default AddCode;