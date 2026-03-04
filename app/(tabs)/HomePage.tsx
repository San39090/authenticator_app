import { Camera, CameraView } from "expo-camera";
import { generate, generateSync } from 'otplib';
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";

interface OtpAccount {
    id: String,
    issuer: String,
    secret: String,
    code: String,
    account: String
}

const HomePage = () => {
    const [codes, setCodes] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const BASEURL = "https://authenticator-backend-h4al.onrender.com";
    const [timer, setTimer] = useState(30);
    const [otpList, setOtpList] = useState<OtpAccount[]>([]);

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

    useEffect(()=>{
        fetchAllSecrets();
    },[]);

    const fetchAllSecrets = async () => {
        try {
            const res = await fetch(`${BASEURL}/get/secrets`);
            if (res.ok) {
                const result = await res.json();
                setOtpList(result);
            }
            else {
                const result = await res.json();
                ToastAndroid.show(result.message, ToastAndroid.SHORT);
            }
        } catch (error) {
            console.log(error);
        }
    }

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
            console.log(error);
            console.error(error);
        }

    }

    const saveToCloud = async (parsed: any) => {
        try {
            const result = await fetch(`${BASEURL}/savetocloud`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account: parsed.account,
                    issuer: parsed.issuer,
                    secret: parsed.secret
                })
            })
            if (result.ok) {
                ToastAndroid.show("Saved succesfully", ToastAndroid.SHORT);
            }
            else {
                ToastAndroid.show("Failed to save QR", ToastAndroid.SHORT);
            }
        } catch (error: any) {
            console.log(error.stack);
            ToastAndroid.show("Error occurred", ToastAndroid.SHORT);
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
        <View style={{ flex: 1 }}>
            {showScanner && (
                <View style={styles.scannerOverlay}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                        }}
                    />

                    <TouchableOpacity
                        onPress={() => setShowScanner(false)}
                        style={styles.closeScannerBtn}
                    >
                        <Feather name="x" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
            {showAdd && (
                <View style={styles.overlay}>
                    <View style={styles.popup}>
                        <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.closeAdd}>
                            <Feather name="x" size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setShowScanner(true); setShowAdd(false); setScanned(false); cameraPermission() }} style={styles.addButtons} >
                            <Text style={styles.addOptions}>Scan a QR Code</Text>
                            <Feather name="camera" size={20} />
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.addButtons} >
                            <Text style={styles.addOptions}>Enter a setup key</Text>
                            <FontAwesome name="keyboard-o" size={20} />
                        </TouchableOpacity> */}
                    </View>
                </View>
            )}
            <ScrollView>
                <View style={styles.container}>
                    {/* <View style={styles.search}>
                        <Feather name="menu" size={25} />
                        <TextInput

                        />
                    </View> */}
                    {otpList.length > 0 && otpList.map((item) => (
                        <View key={item.id} style={styles.box}>

                            <Text style={styles.nameText}>{item.account} {item?.issuer}</Text>

                            <View style={styles.rowBetween}>
                                <Text style={styles.codeText}>{item?.code}</Text>

                                <View style={styles.timer}>
                                    <Text style={{ fontSize: 12 }}>{timer}</Text>
                                </View>
                            </View>

                        </View>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.plusButton}>
                <Feather name="plus" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 60, // Extra space for status bar
        paddingHorizontal: 16,
        backgroundColor: '#F8F9FA', // Light grey background for the whole app
        minHeight: '100%',
    },
    // Search Bar
    search: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 10,
        // Soft Shadow
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    // OTP Cards
    box: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    nameText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575', // Muted label color
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codeText: {
        fontSize: 32, // Large, readable code
        letterSpacing: 4,
        fontWeight: '700',
        color: '#007AFF', // Professional Blue
    },
    timer: {
        backgroundColor: '#E8F2FF',
        width: 35,
        height: 35,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    timerText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    // Floating Plus Button
    plusButton: {
        position: 'absolute',
        bottom: 40,
        right: 25,
        backgroundColor: '#007AFF',
        width: 65,
        height: 65,
        borderRadius: 33,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#007AFF',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
    },
    // Overlays & Popups
    overlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end', // Slide up from bottom feel
        zIndex: 10,
    },
    popup: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        paddingBottom: 50,
        alignItems: 'center',
    },
    addButtons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    addOptions: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    closeAdd: {
        marginBottom: 15,
        alignSelf: 'center',
    },
    scannerOverlay: {
        flex: 1,
        backgroundColor: 'black',
        zIndex: 1000,
    },
    closeScannerBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 25,
    }
});

export default HomePage;