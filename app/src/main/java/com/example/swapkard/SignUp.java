package com.example.swapkard;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.util.Base64;
import android.widget.Button;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;
import com.google.firebase.FirebaseException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.PhoneAuthCredential;
import com.google.firebase.auth.PhoneAuthOptions;
import com.google.firebase.auth.PhoneAuthProvider;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;

import java.security.MessageDigest;

public class SignUp extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_sign_up);
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