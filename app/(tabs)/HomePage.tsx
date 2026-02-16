import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { CameraView, Camera } from "expo-camera";
import {authenticator} from "otplib";

const HomePage = () => {
    const [codes, setCodes] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const BASEURL = "http://localhost:8080";
    const [timer, setTimer] = useState(30);
    const [otpList,setOtpList] = useState([]);

    const sampleData = [
        {
            id: 0,
            code: 123456,
            name: "Stripe"
        },
        {
            id: 1,
            code: 234567,
            name: "Microsoft"
        },
        {
            id: 2,
            code: 345678,
            name: "Google"
        }
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            const seconds = Math.floor(Date.now() / 1000);
            const remaining = 30 - (seconds % 30);
            setTimer(remaining);

            if(remaining === 30){
                setOtpList((prev:any) => 
                    prev.map((item:any) => ({
                        ...item,
                        code:authenticator.generate(item.secret)
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

    const handleBarCodeScanned = ({ data }: any) => {
        setShowScanner(false);
        setScanned(true);
        ToastAndroid.show("QR scanned", ToastAndroid.SHORT);
        const parsed = parseOTP(data);
        const code = authenticator.generate(parsed.secret);
        setOtpList((prev:any)=>[...prev,code]);
        // saveToCloud(parsed);
        console.log("Scanned Data:", parsed);
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

    const parseOTP = (data: string) => {
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
                        <TouchableOpacity style={styles.addButtons} >
                            <Text style={styles.addOptions}>Enter a setup key</Text>
                            <FontAwesome name="keyboard-o" size={20} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.search}>
                        <Feather name="menu" size={25} />
                        <TextInput

                        />
                    </View>
                    {sampleData.length > 0 && sampleData.map((item) => (
                        <View key={item.id} style={styles.box}>

                            <Text style={styles.nameText}>{item.name}</Text>

                            <View style={styles.rowBetween}>
                                <Text style={styles.codeText}>{item.code}</Text>

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
        paddingVertical: 40,
        paddingHorizontal: 20
    },
    plusButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#222',
        width: 60,
        height: 60,
        borderRadius: 30,   // circle
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    addButtons: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 8,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: 'black',
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10,
        borderRadius: 10
    },
    popup: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 10,
        alignItems: 'center'
    },
    closeBtn: {
        marginTop: 15,
        backgroundColor: '#222',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    addOptions: {
        fontSize: 18,
        marginBottom: 10
    },
    closeAdd: {
        display: 'flex',
        alignSelf: 'flex-end',
        borderColor: '#222',
        borderWidth: 2
    },
    search: {
        backgroundColor: '#ccc',
        borderRadius: 5,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8
    },
    box: {
        backgroundColor: '#ccc',
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
    },
    timer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codeText: {
        fontSize: 18,
        letterSpacing: 2,
        fontWeight: '600',
    },
    scannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,        // 👈 bring to front
        elevation: 999,     // 👈 Android
        backgroundColor: 'black',
    },
    closeScannerBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#000',
        padding: 10,
        borderRadius: 20
    }
})

export default HomePage;