package com.example.swapkard;

import static android.content.Context.MODE_PRIVATE;

import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Bundle;
import androidx.fragment.app.Fragment;

import android.os.StrictMode;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import org.bson.Document;

import java.util.Arrays;
import java.util.List;


import java.util.HashMap;

import io.realm.Realm;
import io.realm.mongodb.App;
import io.realm.mongodb.AppConfiguration;
import io.realm.mongodb.Credentials;
import io.realm.mongodb.User;
import io.realm.mongodb.functions.Functions;
import java.util.UUID;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

public class passowrdFragment extends Fragment {

    HashMap<String,String> mp;
    private static final String param1 = "HashMap";
    private static App app;

    private static String uniqueId;
    private Bitmap bmp;
    public passowrdFragment() {
        // Required empty public constructor
    }


    public static passowrdFragment newInstance(HashMap<String,String> map) {
        passowrdFragment fragment = new passowrdFragment();
        Bundle args = new Bundle();
        args.putSerializable(param1,map);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    @SuppressWarnings("unchecked")
    public void onCreate(Bundle savedInstanceState) {
        StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
        StrictMode.setThreadPolicy(policy);
        super.onCreate(savedInstanceState);
        Bundle info = getArguments();
        if (info != null) mp = (HashMap<String, String>) info.getSerializable(param1);
        if (getContext()!=null) Realm.init(getContext());
        app = new App(new AppConfiguration.Builder(UserSignUpTools.getRealmAppId()).build());
        app.loginAsync(Credentials.anonymous(), result -> {
                if (result.isSuccess())  Log.d("Login","Logged In Successfully");
                else Log.e("AsyncLogin","Login_Failed_GO_Fuck_Yourself");
            }
        );
        Runnable qrCodeGenerator = new Runnable() {
            @Override
            public void run() {
                uniqueId = UUID.randomUUID().toString();
                QRCodeWriter qrCodeWriter = new QRCodeWriter();
                try {
                    BitMatrix bitMatrix = qrCodeWriter.encode(uniqueId, BarcodeFormat.QR_CODE, 200, 200);
                    int width = bitMatrix.getWidth();
                    int height = bitMatrix.getHeight();
                    Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
                    for (int x = 0; x < width; x++) {
                        for (int y = 0; y < height; y++) {
                            bitmap.setPixel(x, y, bitMatrix.get(x, y) ? Color.BLACK : Color.WHITE);
                        }
                    }
                    bmp=bitmap;
                }
                catch (WriterException e) {
                    bmp=null;
                    if (e.getMessage()!=null) Log.e("QR_CODE_GENERATOR",e.getMessage());
                }

            }
        };
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_passowrd, container, false);
        Button nextButton = view.findViewById(R.id.passwordAccept);
        Fragment currFragInst = this;
        nextButton.setOnClickListener(v->{
                nextButton.setEnabled(false);
                EditText passwordField = view.findViewById(R.id.passwordField);
                String password = passwordField.getText().toString().trim();
                boolean flag1=false,flag2=false,flag3=false;
                for (int i=0;i<password.length();i++){
                    if (password.charAt(i)>='0' && password.charAt(i)<='9') flag1=true;
                    if (password.charAt(i)>='a' && password.charAt(i)<='z') flag2=true;
                    if (password.charAt(i)>='A' && password.charAt(i)<='Z') flag3=true;
                }
                if (flag1 && flag2 && flag3 && password.length()>=6){
                    String sha256checksum = UserSignUpTools.sha256Checksum(password,this,mp);
                    mp.put("Password",sha256checksum);
                    List<String> args = Arrays.asList(uniqueId,
                            mp.get("UserFirstName"),
                            mp.get("UserLastName"),
                            mp.get("PhoneNo"),
                            mp.get("Salt"),
                            mp.get("Password"));
                    User currentUser =  app.currentUser();
                    Functions userSignUpFunction = currentUser.getFunctions();
                    userSignUpFunction.callFunctionAsync("UserRegistration",args,Document.class,result->{
                        if (result.isSuccess()) {
                            SharedPreferences userMetaDetails = getActivity().getSharedPreferences("UserMetaDetails",MODE_PRIVATE);
                            SharedPreferences.Editor editor = userMetaDetails.edit();
                            for (Map.Entry<String,String> elements: mp.entrySet()){
                                editor.putString(elements.getKey(),elements.getValue());
                            }
                            editor.putBoolean("isSignedUp",true);
                            editor.putBoolean("isEmailVerified",false);
                            editor.putBoolean("staySignedIn",true);
                            editor.apply();
                        }
                        else{
                            result.getError().printStackTrace();
                            Log.e("asyncCall","failed");
                            nextButton.setEnabled(true);
                        }
                    });
                }
                else{
                    UserSignUpTools.showAlert(currFragInst,"Password requires 1 uppercase char, one lower case char, one num and at least size 6");
                    nextButton.setEnabled(true);
                }
            }
        );
        return view;
    }
}
