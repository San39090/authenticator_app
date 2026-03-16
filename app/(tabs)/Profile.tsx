import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ToastAndroid, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from "react-native-vector-icons/Feather";

const Profile = () => {
    const route = useRouter();
    const [email,setEmail] = useState("");

    useEffect(()=>{
        const getEmail = async() => {
            const res = await SecureStore.getItemAsync("Email");
            setEmail(res || "");
        }
        getEmail();
    },[]);

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync('UserId');
            await SecureStore.deleteItemAsync('Email');
            
            ToastAndroid.show("You have been logged out successfully",ToastAndroid.SHORT);
            console.log("moving to login page");
            route.replace("/IndexPage");
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const SettingItem = ({ icon, title, color = "#333" }: any) => (
        <TouchableOpacity style={styles.item}>
            <View style={styles.itemLeft}>
                <View style={[styles.iconBg, { backgroundColor: color + '15' }]}>
                    <Feather name={icon} size={20} color={color} />
                </View>
                <Text style={[styles.itemText, { color }]}>{title}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Settings</Text>

                {/* Profile Header Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{email.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userLabel}>Active Account</Text>
                        <Text style={styles.emailText}>{email}</Text>
                    </View>
                </View>

                {/* Settings Group */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Security</Text>
                    <SettingItem icon="lock" title="App Lock" color="#007AFF" />
                    <SettingItem icon="cloud-off" title="Cloud Sync" color="#007AFF" />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Account</Text>
                    <TouchableOpacity style={styles.item} onPress={handleLogout}>
                        <View style={styles.itemLeft}>
                            <View style={[styles.iconBg, { backgroundColor: '#FF3B3015' }]}>
                                <Feather name="log-out" size={20} color="#FF3B30" />
                            </View>
                            <Text style={[styles.itemText, { color: '#FF3B30' }]}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.version}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        padding: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 25,
        marginTop: 10,
    },
    profileCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    userInfo: {
        marginLeft: 16,
    },
    userLabel: {
        fontSize: 12,
        color: '#8E8E93',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    emailText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    section: {
        marginBottom: 25,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    item: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        color: '#CCC',
        marginTop: 20,
        fontSize: 12,
    }
});

export default Profile;