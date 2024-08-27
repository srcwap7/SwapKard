package com.example.swapkard;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.widget.Button;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.cloudinary.Cloudinary;
import com.cloudinary.android.MediaManager;
import com.cloudinary.utils.ObjectUtils;
import com.google.firebase.FirebaseException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.PhoneAuthCredential;
import com.google.firebase.auth.PhoneAuthOptions;
import com.google.firebase.auth.PhoneAuthProvider;

import org.bson.Document;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import java.security.MessageDigest;

import io.realm.Realm;
import io.realm.mongodb.App;
import io.realm.mongodb.AppConfiguration;
import io.realm.mongodb.Credentials;
import io.realm.mongodb.functions.Functions;

public class SignUp extends AppCompatActivity {
    private  App app;
    private  boolean isConnectedToRealm;

    private  boolean isConnectedToCloudinary;

    private BroadcastReceiver broadcastReceiver;

    private void performRealmLogin(){
        Realm.init(getApplicationContext());
        app = new App( new AppConfiguration.Builder(UserSignUpTools.getRealmAppId()).build());
        app.loginAsync(Credentials.anonymous(),result ->{
            if (result.isSuccess()){
                isConnectedToRealm=true;
                Functions functions = app.currentUser().getFunctions();
                Log.d("DEBUG_A",functions.toString());
                Log.d("RealmConnectionManager","Connection To Realm Done!");
                Intent intent = new Intent("com.example.connectedToRealm");
                LocalBroadcastManager.getInstance(getApplicationContext()).sendBroadcast(intent);
            }
            else{
                Log.d("RealmConnectionManager","Connection To Realm Unsuccessful");
            }
        });
    }

    public App getApp(){
        return app;
    }
    public boolean checkRealmConnection(){
        return isConnectedToRealm;
    }

    public  boolean checkCloudinaryConnection(){
        return isConnectedToCloudinary;
    }
    private void performCloudinaryLogin(){
        try{
            Cloudinary cloudinary = MediaManager.get().getCloudinary();
            if (cloudinary!=null) isConnectedToCloudinary=true;
        }
        catch(Exception e) {
            Map<String, String> config = new HashMap<>();
            config.put("cloud_name", getString(R.string.CloudName));
            config.put("api_key", getString(R.string.APIKey));
            config.put("api_secret", getString(R.string.APISecret));
            MediaManager.init(getApplicationContext(), config);
            isConnectedToCloudinary = true;
            Log.d("cloudinaryConnectionManger", "Connected To Cloudinary");
            Intent intent = new Intent("com.example.connectedToCloudinary");
            LocalBroadcastManager.getInstance(getApplicationContext()).sendBroadcast(intent);
        }
    }

    protected void onStart(){
        registerReceiver(broadcastReceiver,new IntentFilter("android.net.conn.CONNECTIVITY_CHANGE"));
        super.onStart();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_sign_up);
        isConnectedToCloudinary=false;
        isConnectedToRealm=false;
        broadcastReceiver = new BroadcastReceiver() {
            int counter=0;
            @Override
            public void onReceive(Context context, Intent intent) {
                if (UserSignUpTools.isInternetAvailable(getApplicationContext())) {
                    if (!isConnectedToRealm) performRealmLogin();
                    if (!isConnectedToCloudinary) performCloudinaryLogin();
                }
                else{
                    if (counter==0) Toast.makeText(getApplicationContext(),"Could not connect to Backend",Toast.LENGTH_SHORT).show();
                    counter=1;
                }
            }
        };
        if (savedInstanceState==null){
            HashMap<String,String> mp = new HashMap<>();
            FragmentTransaction usernameLoader = getSupportFragmentManager().beginTransaction();
            UsernamePrompt usernamePromptInstance = UsernamePrompt.newInstance(mp);
            usernameLoader.add(R.id.fragment_username_prompt,usernamePromptInstance);
            usernameLoader.commit();
        }
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    @Override
    protected void onDestroy() {
        LocalBroadcastManager.getInstance(getApplicationContext()).unregisterReceiver(broadcastReceiver);
        super.onDestroy();
    }
}

class UserSignUpTools{
    public static void beginFirebaseOTPTransaction(String PhoneNO, Fragment fragment,boolean flag,HashMap<String,String> mp){
        FirebaseAuth firebaseTransactionInstance = FirebaseAuth.getInstance();
        AppCompatActivity activity = (AppCompatActivity) fragment.getActivity();
        PhoneAuthProvider.OnVerificationStateChangedCallbacks mCallbacks = new PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
            @Override
            public void onVerificationCompleted(@NonNull PhoneAuthCredential phoneAuthCredential) {

            }
            @Override
            public void onVerificationFailed(@NonNull FirebaseException e) {
                showAlert(fragment,"Please ensure you have entered a Valid Phone No");
                Button nextbutton=null;
                if (fragment.getActivity()!=null) nextbutton = fragment.getActivity().findViewById(R.id.phoneNoNextButton);
                if (nextbutton!=null) nextbutton.setEnabled(true);
            }
            public void onCodeSent(@NonNull String verificationId,@NonNull PhoneAuthProvider.ForceResendingToken forceResendingToken){
                FragmentTransaction newTransaction = activity.getSupportFragmentManager().beginTransaction();
                newTransaction.replace(R.id.fragment_username_prompt,otpEntry.newInstance(verificationId,PhoneNO,mp));
                if (flag) newTransaction.addToBackStack(null);
                newTransaction.commit();
            }
        };
        PhoneAuthOptions userContactDetails = PhoneAuthOptions.newBuilder(firebaseTransactionInstance).
                setTimeout(60L,TimeUnit.SECONDS).
                setPhoneNumber(PhoneNO).
                setActivity(activity).
                setCallbacks(mCallbacks).
                build();
        PhoneAuthProvider.verifyPhoneNumber(userContactDetails);
    }
    public static void previousTransaction(Fragment fragment){
        fragment.getActivity().getSupportFragmentManager().popBackStack();
    }

    public static void showAlert(Fragment fragment,String str){
        AlertDialog.Builder builder = new AlertDialog.Builder(fragment.getContext());
        builder.setTitle("Error Encountered");
        builder.setMessage(str);
        builder.setPositiveButton("Ok", (dialog,which) -> {dialog.dismiss();} );
        builder.show();
    }

    public static byte[] salting(String str,HashMap<String,String> mp){
        SecureRandom saltInstance = new SecureRandom();
        byte[] salt = new byte[16];
        saltInstance.nextBytes(salt);
        byte[] stringBytes = str.getBytes(StandardCharsets.UTF_8);
        byte[] finalByte = new byte[salt.length+stringBytes.length];
        System.arraycopy(salt,0,finalByte,0,salt.length);
        System.arraycopy(stringBytes,0,finalByte,salt.length,stringBytes.length);
        String saltString = Base64.encodeToString(salt, Base64.DEFAULT);
        mp.put("Salt",saltString);
        return finalByte;
    }
    public static String sha256Checksum(String str,Fragment fragment,HashMap<String,String>mp){
        try{
            MessageDigest digestInstance = MessageDigest.getInstance("SHA-256");
            byte[] byteArray = digestInstance.digest(salting(str,mp));
            StringBuilder checksum = new StringBuilder(2*byteArray.length);
            for (int i = 0; i < byteArray.length; i++) {
                String hex = Integer.toHexString(0xff & byteArray[i]);
                if(hex.length() == 1)  checksum.append('0');
                checksum.append(hex);
            }
            return checksum.toString();
        }
        catch (Exception e){
            showAlert(fragment,"We failed to Encrypt your data! please retry");
            return null;
        }
    }
    public static String getRealmAppId() {
        return BuildConfig.REALM_APP_ID;
    }

    public static void showAlertActivity(Context context, String str){
        AlertDialog.Builder dialogBox = new AlertDialog.Builder(context);
        dialogBox.setTitle("Error Encountered");
        dialogBox.setMessage(str);
        dialogBox.setPositiveButton("ok", (dialog, which) -> {
            dialog.dismiss();
        });
        dialogBox.show();
    }

    public static boolean isInternetAvailable(Context context) {
        ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (connectivityManager != null) {
            NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
            return activeNetworkInfo != null && activeNetworkInfo.isConnected();
        }
        return false;
    }
}