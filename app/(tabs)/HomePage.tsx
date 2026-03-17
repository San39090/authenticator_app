import { Camera, CameraView } from "expo-camera";
import { generate, generateSync } from 'otplib';
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as SecureStore from 'expo-secure-store';
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface OtpAccount {
    id: string,
    issuer: string,
    secret: string,
    code: string,
    account: string
}

const HomePage = () => {
    const [codes, setCodes] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const BASEURL = "https://authenticator-backend-h4al.onrender.com";
    // const BASEURL = "http://10.76.238.54:8080";
    const [timer, setTimer] = useState(30);
    const [otpList, setOtpList] = useState<OtpAccount[]>([]);
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const seconds = Math.floor(Date.now() / 1000);
            const remaining = 30 - (seconds % 30);
            setTimer(remaining);

            if (remaining === 30) {
                setOtpList((prev: any) =>
                    prev.map((item: any) => ({
                        ...item,
                        code: generateSync({
                            secret: item.secret
                        })
                    }))
                )
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const cameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted")
    }

    useEffect(() => {
        fetchStorage();
        fetchAllSecrets();
    }, []);

    const fetchStorage = async () => {
        const res = await SecureStore.getItemAsync("Email");
        setUserEmail(res || "");
    }

    const fetchAllSecrets = async () => {
        try {
            const res = await fetch(`${BASEURL}/get/secrets`);
            if (res.ok) {
                const result = await res.json();
                console.log(result);
                const otps = result.map((item: any) => ({
                    ...item,
                    code: generateSync({
                        secret: item.secret
                    })
                }))
                setOtpList(otps);
            }
            else {
                const result = await res.json();
                ToastAndroid.show(result.message, ToastAndroid.SHORT);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // const handleCodeEntered = async ({ code, issuer }: any) => {
    //     const cleanCode = code.replace(/\s/g, '').toUpperCase();
    //     if (!cleanCode) {
    //         ToastAndroid.show("Please enter correct code", ToastAndroid.SHORT);
    //         return;
    //     }
    //     try {
    //         const res = await fetch(`${BASEURL}/save/secret`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 secret: cleanCode,
    //                 issuer: issuer,
    //                 account: userEmail
    //             })
    //         });
    //         if (res.ok) {
    //             ToastAndroid.show(`${issuer} added successfully`, ToastAndroid.SHORT);
    //             fetchAllSecrets();
    //         }
    //         else {
    //             ToastAndroid.show(`Error adding ${issuer}. Please check your internet connection`, ToastAndroid.SHORT)
    //         }
    //         const initialCode = generateSync({
    //             secret: cleanCode || "",
    //         });
    //         const newEntry = {
    //             id: Date.now().toString(),
    //             secret: cleanCode,
    //             issuer: issuer,
    //             account: userEmail,
    //             code: initialCode
    //         }
    //         setOtpList((prev: any) => [...prev, newEntry]);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    const handleBarCodeScanned = async ({ data }: any) => {
        try {
            setShowScanner(false);
            setScanned(true);
            ToastAndroid.show("QR scanned", ToastAndroid.SHORT);
            const parsed = parseQr(data);
            console.log(parsed);
            const res = await fetch(`${BASEURL}/save/secret`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    issuer: parsed?.issuer || "",
                    account: parsed?.account || "",
                    secret: parsed?.secret || ""
                })
            })
            if (res.ok) {
                ToastAndroid.show(`${parsed?.issuer} added successfully`, ToastAndroid.SHORT);
                fetchAllSecrets();
            }
            else {
                ToastAndroid.show(`Error adding ${parsed?.issuer}. Please check your internet connection`, ToastAndroid.SHORT)
            }
            const initialCode = generateSync({
                secret: parsed?.secret || "",
            });
            const newEntry = {
                id: Date.now().toString(),
                secret: parsed?.secret,
                issuer: parsed?.issuer,
                account: parsed?.account,
                code: initialCode
            }
            setOtpList((prev: any) => [...prev, newEntry]);
        } catch (error) {
            console.error(error);
        }

    }


    const parseQr = (data: string) => {
        try {
            const withoutPrefix = data.replace("otpauth://totp/", "");
            const [labelPart, queryPart] = withoutPrefix.split("?");
            const [issuesFromLabel, account] = labelPart.split(":");
            const params = new URLSearchParams(queryPart);
            const secret = params.get("secret");
            const issuer = params.get("issuer") || issuesFromLabel;

            return {
                issuer,
                account,
                secret
            }
        } catch (error: any) {
            ToastAndroid.show("Please scan a valid Qr Code", ToastAndroid.SHORT);
            console.log(error.stack);
        }
    }

    return (
        <View style={styles.mainWrapper}>
            <StatusBar barStyle="default" />

            {/* 1. SCANNER OVERLAY */}
            {showScanner && (
                <View style={styles.scannerOverlay}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                    />
                    <TouchableOpacity onPress={() => setShowScanner(false)} style={styles.closeScannerBtn}>
                        <Feather name="x" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.scanFrame} />
                </View>
            )}

            {/* 2. ADD ACCOUNT BOTTOM SHEET */}
            {showAdd && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setShowAdd(false)}
                >
                    <View style={styles.popup}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.popupTitle}>Add Account</Text>

                        <TouchableOpacity
                            onPress={() => { setShowScanner(true); setShowAdd(false); cameraPermission(); }}
                            style={styles.addButtons}
                        >
                            <View style={styles.iconCircle}>
                                <Feather name="camera" size={20} color="#007AFF" />
                            </View>
                            <Text style={styles.addOptions}>Scan a QR Code</Text>
                            <Feather name="chevron-right" size={20} color="#CCC" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.addButtons}
                            onPress={() => { setShowAdd(false); router.push("/AddCode"); }}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: '#E8F2FF' }]}>
                                <FontAwesome name="keyboard-o" size={20} color="#007AFF" />
                            </View>
                            <Text style={styles.addOptions}>Enter a setup key</Text>
                            <Feather name="chevron-right" size={20} color="#CCC" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )}

            {/* 3. MAIN LIST AREA */}
            <SafeAreaView style={{ flex: 1 }}>
                {/* <View style={styles.header}>
                    <Text style={styles.headerTitle}>Authenticator</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Feather name="log-out" size={22} color="#666" />
                    </TouchableOpacity>
                </View> */}

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {otpList.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Feather name="shield" size={80} color="#E0E0E0" />
                            <Text style={styles.emptyText}>No codes yet. Tap the + to add one.</Text>
                        </View>
                    ) : (
                        otpList.map((item) => (
                            <View key={item?.id} style={styles.otpCard}>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.issuerText}>{item?.issuer}</Text>
                                    <Text style={styles.accountText}>{item.account}</Text>
                                </View>
                                <View style={styles.codeRow}>
                                    <Text style={styles.codeText}>
                                        {item?.code?.toString().slice(0, 3)} {item?.code?.toString().slice(3)}
                                    </Text>
                                    <View style={styles.timerContainer}>
                                        <Text style={styles.timerText}>{timer}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* 4. FLOATING ACTION BUTTON */}
            <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.plusButton}>
                <Feather name="plus" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    mainWrapper: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 100 },
    
    // OTP Card Styles
    otpCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginTop: 16,
        // Professional Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardInfo: { marginBottom: 12 },
    issuerText: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    accountText: { fontSize: 14, color: '#666', marginTop: 2 },
    codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    codeText: { fontSize: 36, fontWeight: '800', color: '#007AFF', letterSpacing: 2 },
    
    timerContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 2,
        borderColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F7FF',
    },
    timerText: { fontSize: 14, fontWeight: 'bold', color: '#007AFF' },

    // FAB
    plusButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#007AFF',
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#007AFF',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 5 },
    },

    // Bottom Sheet (Add Options)
    overlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        zIndex: 100,
    },
    popup: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    popupTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: '#1A1A1A' },
    addButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    addOptions: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },

    // Scanner
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000', 
        zIndex: 1000 
    },
    scanFrame: {
        position: 'absolute',
        alignSelf: 'center',
        top: '25%',
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    closeScannerBtn: {
        position: 'absolute',
        top: 60,
        right: 25,
        zIndex: 1001,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 50,
    },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#999', marginTop: 20, fontSize: 16 }
});

export default HomePage;