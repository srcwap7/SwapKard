package com.example.swapkard;

import static android.content.ContentValues.TAG;
import static android.content.Context.MODE_PRIVATE;

import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.os.Handler;
import android.os.Looper;
import android.os.StrictMode;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import org.bson.Document;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.ArrayList;
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

import com.cloudinary.android.callback.ErrorInfo;
import com.cloudinary.android.callback.UploadCallback;
import com.google.gson.Gson;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.cloudinary.android.MediaManager;

public class passowrdFragment extends Fragment {

    HashMap<String,String> mp;
    private static final String param1 = "HashMap";
    private static App app;

    private static String uniqueId;

    private static Integer status,executed;
    public passowrdFragment() {
        // Required empty public constructor
    }

    private void uploadImage(Uri fileUri,HashMap<String,String> mp,Button nextButton,Fragment fragment) {
        MediaManager.get().upload(fileUri)
                .unsigned("MahaRudra") 
                .callback(new UploadCallback() {
                    @Override
                    public void onStart(String requestId) {
                        Log.d(TAG, "Upload started");
                    }

                    @Override
                    public void onProgress(String requestId, long bytes, long totalBytes) {
                        Log.d(TAG, "Uploading: " + (bytes / totalBytes) * 100 + "%");
                    }

                    @Override
                    public void onSuccess(String requestId, Map resultData) {
                        Log.d(TAG, "Upload successful");
                        mp.put("Public_id", (String) resultData.get("public_id"));
                        User currentUser = app.currentUser();
                        Functions userSignUpFunction = currentUser.getFunctions();
                        List<String> args = Arrays.asList(uniqueId,
                                mp.get("UserFirstName"),
                                mp.get("UserLastName"),
                                mp.get("PhoneNo"),
                                mp.get("Salt"),
                                mp.get("Password"),mp.get("Public_id"));
                        userSignUpFunction.callFunctionAsync("UserRegistration", args, Document.class, result -> {
                            if (result.isSuccess()) {
                                Document doc = result.get();
                                if  (doc.getString("status").equals("Done")) {
                                    SharedPreferences userMetaDetails = getActivity().getSharedPreferences("UserMetaDetails", MODE_PRIVATE);
                                    SharedPreferences.Editor editor = userMetaDetails.edit();
                                    for (Map.Entry<String, String> elements : mp.entrySet())
                                        editor.putString(elements.getKey(), elements.getValue());
                                    editor.putBoolean("isSignedUp", true);
                                    editor.putBoolean("isEmailVerified", false);
                                    editor.putBoolean("staySignedIn", true);
                                    ArrayList<Bitmap> arr = new ArrayList<>();
                                    String json = new Gson().toJson(arr);
                                    editor.putString("PendingRequestsCards",json);
                                    editor.putString("UserId",uniqueId);
                                    editor.apply();
                                    Intent newIntent = new Intent(getContext(), HomeScreenCumRedirectToSignUp.class);
                                    startActivity(newIntent);
                                    getActivity().finish();
                                }
                                else if (doc.getString("status").equals("Present")){
                                    Log.e("MongoDBHandler","Account With same PhoneNo present");
                                    nextButton.setEnabled(true);
                                    Handler handler = new Handler(Looper.getMainLooper());
                                    handler.post(new Runnable(){
                                        @Override
                                        public void run() {
                                            AlertDialog.Builder builder = new AlertDialog.Builder(fragment.getActivity());
                                            builder.setTitle("Account Exists");
                                            builder.setMessage("Want to login to the account?");
                                            builder.setPositiveButton("Ok",((dialog, which) -> {
                                                FragmentTransaction redirectToLogin = getActivity().getSupportFragmentManager().beginTransaction();
                                                redirectToLogin.replace(R.id.fragment_username_prompt,signInPrompt.newInstance());
                                                redirectToLogin.commit();
                                            }));
                                            builder.setNegativeButton("Back To SignUp",((dialog, which) -> {
                                                FragmentTransaction redirectToSignUp = getActivity().getSupportFragmentManager().beginTransaction();
                                                HashMap<String,String> map = new HashMap<>();
                                                redirectToSignUp.replace(R.id.fragment_username_prompt,UsernamePrompt.newInstance(map));
                                                redirectToSignUp.commit();
                                            }));
                                        }
                                    });
                                }
                                else{
                                    Log.e("MongoDBHandler",doc.getString("error"));
                                    Toast.makeText(getContext(),"Error Encountered",Toast.LENGTH_SHORT).show();
                                    nextButton.setEnabled(true);
                                }
                            }else{
                                result.getError().printStackTrace();
                                Toast.makeText(getContext(),"We Could not store your data to cloud",Toast.LENGTH_SHORT).show();
                                Log.e("asyncCall", "failed");
                                nextButton.setEnabled(true);
                            }
                        });
                    }

                    @Override
                    public void onError(String requestId, ErrorInfo error) {
                        Log.e(TAG, "Upload error: " + error.getDescription());

                    }

                    @Override
                    public void onReschedule(String requestId, ErrorInfo error) {
                        Log.d(TAG, "Upload rescheduled");
                    }
                })
                .dispatch();
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
        status=0;
        executed=0;
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
        Map<String,String> config = new HashMap<>();
        config.put("cloud_name",getString(R.string.CloudName));
        config.put("api_key",getString(R.string.APIKey));
        config.put("api_secret",getString(R.string.APISecret));
        if (getActivity()!=null) MediaManager.init(getActivity(),config);
        Runnable qrCodeGenerator = new Runnable() {
            @Override
            public void run() {
                uniqueId = UUID.randomUUID().toString();
                QRCodeWriter qrCodeWriter = new QRCodeWriter();
                try {
                    BitMatrix bitMatrix = qrCodeWriter.encode(uniqueId, BarcodeFormat.QR_CODE, 500, 500);
                    int width = bitMatrix.getWidth();
                    int height = bitMatrix.getHeight();
                    Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
                    for (int x = 0; x < width; x++) {
                        for (int y = 0; y < height; y++) {
                            bitmap.setPixel(x, y, bitMatrix.get(x, y) ? Color.BLACK : Color.WHITE);
                        }
                    }
                    File directory=null;
                    if (getContext()!=null) directory = getContext().getFilesDir();
                    File filePath = new File(directory,"qrcode.png");
                    FileOutputStream fos=null;
                    try {
                        fos = new FileOutputStream(filePath);
                        bitmap.compress(Bitmap.CompressFormat.PNG, 100, fos);
                    }
                    catch(FileNotFoundException e){
                        status=0;
                        executed=1;
                        if (e.getMessage()!=null) Log.d("IOHandle",e.getMessage());
                    }
                    finally{
                        try{
                            if (fos!=null) {
                                fos.close();
                                status = 1;
                                executed = 1;
                                Log.d("QRCodeGenerator","No exception! Good to go");
                            }
                        }
                        catch(IOException e){
                            if (e.getMessage()!=null) Log.d("IOHandle",e.getMessage());
                            status=0;
                            executed=1;
                        }
                    }
                }
                catch (WriterException e) {
                    status=0;
                    executed=1;
                    if (e.getMessage()!=null) Log.e("QR_CODE_GENERATOR",e.getMessage());
                }
            }
        };
        ExecutorService executorService = Executors.newSingleThreadExecutor();
        executorService.execute(qrCodeGenerator);
        Runnable createCard = new Runnable(){
            @Override
            public void run() {
               ImageManipulation.manipulateImage(R.drawable.card_default_template,1290,380,2260,770,58, 67, 60,181, 207, 173,185,getActivity(),mp.get("UserFirstName")+" "+mp.get("UserLastName"));
            }
        };
        executorService.execute(createCard);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_passowrd, container, false);
        Button nextButton = view.findViewById(R.id.passwordAccept);
        Fragment currFragInst = this;
        nextButton.setOnClickListener(v-> {
                    if (executed == 1) {
                        if (status == 1) {
                            nextButton.setEnabled(false);
                            EditText passwordField = view.findViewById(R.id.passwordField);
                            String password = passwordField.getText().toString().trim();
                            boolean flag1 = false, flag2 = false, flag3 = false;
                            for (int i = 0; i < password.length(); i++) {
                                if (password.charAt(i) >= '0' && password.charAt(i) <= '9')
                                    flag1 = true;
                                if (password.charAt(i) >= 'a' && password.charAt(i) <= 'z')
                                    flag2 = true;
                                if (password.charAt(i) >= 'A' && password.charAt(i) <= 'Z')
                                    flag3 = true;
                            }
                            if (flag1 && flag2 && flag3 && password.length() >= 6) {
                                String sha256checksum = UserSignUpTools.sha256Checksum(password, this, mp);
                                mp.put("Password", sha256checksum);
                                File currentDirectory = null;
                                if (getActivity()!=null) currentDirectory = getActivity().getFilesDir();
                                File userCardFile = new File(currentDirectory,"card.png");
                                Uri uri = Uri.fromFile(userCardFile);
                                uploadImage(uri,mp,nextButton,currFragInst);
                            } else {
                                UserSignUpTools.showAlert(currFragInst, "Password requires 1 uppercase char, one lower case char, one num and at least size 6");
                                nextButton.setEnabled(true);
                            }
                        }
                        else{
                            Log.e("onClickListener","QRCode generator misbehaved");
                            UserSignUpTools.showAlert(this,"Please relaunch the App. We had an exception");
                        }
                    }
                    else{
                        Log.e("onClickListener","QRCode generator not executed");
                        UserSignUpTools.showAlert(this,"Please wait for 30 seconds. No need to restart or refresh app");
                    }
                }
        );
        return view;
    }
}

