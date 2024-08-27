package com.example.swapkard;

import static android.content.ContentValues.TAG;
import static android.content.Context.MODE_PRIVATE;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import androidx.fragment.app.Fragment;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.Toast;

import org.bson.Document;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;


import java.util.HashMap;

import io.realm.mongodb.App;
import io.realm.mongodb.User;
import io.realm.mongodb.functions.Functions;
import java.util.UUID;

import com.cloudinary.android.callback.ErrorInfo;
import com.cloudinary.android.callback.UploadCallback;
import com.google.android.material.textfield.TextInputEditText;
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

    private static int isPendingInvitesCreated,isConnectionCreated;
    private static App app;

    private static String uniqueId;

    private static Handler handler;

    private static Integer status,executed;

    private static boolean isConnectedToRealm,isConnectedToCloudinary;
    public passowrdFragment() {
        // Required empty public constructor
    }

    private void uploadImage(Uri Thumbnail,Uri fileUri,HashMap<String,String> mp,Button nextButton,Fragment fragment) {
        if (isConnectedToCloudinary) {
            MediaManager.get().upload(Thumbnail).unsigned("MahaRudra").callback(new UploadCallback() {
                @Override
                public void onStart(String requestId) {

                }

                @Override
                public void onProgress(String requestId, long bytes, long totalBytes) {

                }

                @Override
                public void onSuccess(String requestId, Map resultData) {
                    String thumbnailId = (String) resultData.get("public_id");
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
                                    User currentUser = app.currentUser();
                                    String Public_id = (String) resultData.get("public_id");
                                    Log.d(TAG, "Upload successful");
                                    mp.put("CloudinaryId", Public_id);
                                    mp.put("ThumbnailId",thumbnailId);
                                    Functions userSignUpFunction = currentUser.getFunctions();
                                    List<String> args = Arrays.asList(uniqueId,
                                            mp.get("UserFirstName"),
                                            mp.get("UserLastName"),
                                            mp.get("PhoneNo"),
                                            mp.get("Salt"),
                                            mp.get("Password"),
                                            mp.get("CloudinaryId"),
                                            mp.get("ThumbnailId"));
                                    userSignUpFunction.callFunctionAsync("UserRegistration", args, Document.class, result -> {
                                        if (result.isSuccess()) {
                                            Document doc = result.get();
                                            if (doc.getString("status").equals("Done")) {
                                                Log.d(TAG, "MONGODB done");
                                                SharedPreferences userMetaDetails = getActivity().getSharedPreferences("UserMetaDetails", MODE_PRIVATE);
                                                SharedPreferences.Editor editor = userMetaDetails.edit();
                                                for (Map.Entry<String, String> elements : mp.entrySet()) editor.putString(elements.getKey(), elements.getValue());
                                                editor.putBoolean("isSignedUp", true);
                                                editor.putBoolean("isEmailVerified", false);
                                                editor.putBoolean("staySignedIn", true);
                                                ArrayList<Bitmap> arr = new ArrayList<>();
                                                String json = new Gson().toJson(arr);
                                                ArrayList<ArrayList<String>> pending_invites = new ArrayList<ArrayList<String>>();
                                                ArrayList<ArrayList<String>> connections = new ArrayList<ArrayList<String>>();
                                                String newJson = new Gson().toJson(pending_invites);
                                                editor.putString("PendingInvites", newJson);
                                                editor.putString("Connections",new Gson().toJson(connections));
                                                editor.putString("UserId", uniqueId);
                                                editor.apply();
                                                Intent newIntent = new Intent(getContext(), MainActivity.class);
                                                newIntent.putExtra("cloudinaryInitialization", true);
                                                startActivity(newIntent);
                                                getActivity().finish();
                                            }
                                            else{
                                                Log.e("MONGODBHandler", doc.getString("error"));
                                                handler.post(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        Toast.makeText(getContext(), "Error Encountered", Toast.LENGTH_SHORT).show();
                                                        nextButton.setEnabled(true);
                                                    }
                                                });
                                            }
                                        } else {
                                            result.getError().printStackTrace();
                                            handler.post(
                                                    new Runnable() {
                                                        @Override
                                                        public void run() {
                                                            Toast.makeText(getContext(), "We Could not store your data to cloud", Toast.LENGTH_SHORT).show();
                                                            Log.e("asyncCall", "failed");
                                                            nextButton.setEnabled(true);
                                                        }
                                                    }
                                            );
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

                @Override
                public void onError(String requestId, ErrorInfo error) {

                }

                @Override
                public void onReschedule(String requestId, ErrorInfo error) {

                }
            }).dispatch();
        }
        else{
            Log.e("CloudConnector","Connection To cloud failed");
            Toast.makeText(getContext(),"You are Not Connected to cloud. Please check connection!",Toast.LENGTH_SHORT).show();
        }
    }
    public static passowrdFragment newInstance(HashMap<String,String> map) {
        passowrdFragment fragment = new passowrdFragment();
        Bundle args = new Bundle();
        args.putSerializable(param1,map);
        fragment.setArguments(args);
        return fragment;
    }

    public boolean createDirectory(String name){
        File directory = getContext().getFilesDir();
        File newDName = new File(directory,name);
        if (!newDName.exists()) {
            boolean isCreated = newDName.mkdir();
            if (isCreated){
                File file = new File(newDName,"ProfilePictures");
                if (!file.exists()) return file.mkdir();
            }
        }
        return false;
    }

    @Override
    @SuppressWarnings("unchecked")
    public void onCreate(Bundle savedInstanceState) {
        status=0;
        executed=0;
        super.onCreate(savedInstanceState);
        Bundle info = getArguments();
        handler=new Handler(Looper.getMainLooper());
        isPendingInvitesCreated=isConnectionCreated=0;
        if (info != null) mp = (HashMap<String, String>) info.getSerializable(param1);
        ExecutorService executorService = Executors.newFixedThreadPool(4);
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
        Runnable createPendingInvites = new Runnable() {
            @Override
            public void run() {
                boolean a = createDirectory("pendingInvites");
                if (a) isPendingInvitesCreated=1;
                else isPendingInvitesCreated=-1;
            }
        };
        Runnable createConnections = new Runnable(){
            @Override
            public void run(){
                boolean a = createDirectory("connections");
                if (a) isConnectionCreated=1;
                else isConnectionCreated=-1;
            }
        };
        Runnable createCard = new Runnable(){
            @Override
            public void run(){
                ImageManipulation.manipulateImage(R.drawable.card_default_template,1290,380,2260,770,58, 67, 60,181, 207, 173,185,getActivity(),mp.get("UserFirstName")+" "+mp.get("UserLastName"));
            }
        };
        executorService.execute(createPendingInvites);
        executorService.execute(createConnections);
        executorService.execute(qrCodeGenerator);
        executorService.execute(createCard);
        executorService.shutdown();
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
                            TextInputEditText passwordField = view.findViewById(R.id.passwordField);
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
                                isConnectedToCloudinary = ((SignUp)getActivity()).checkCloudinaryConnection();
                                isConnectedToRealm = ((SignUp)getActivity()).checkRealmConnection();
                                app = ((SignUp) getActivity()).getApp();
                                String sha256checksum = UserSignUpTools.sha256Checksum(password, this, mp);
                                mp.put("Password", sha256checksum);
                                File currentDirectory = null;
                                if (getActivity()!=null) currentDirectory = getActivity().getFilesDir();
                                File userCardFile = new File(currentDirectory,"card.png");
                                File ThumbnailFile = new File(currentDirectory,"userProfile.png");
                                Uri uri = Uri.fromFile(userCardFile);
                                Uri thumbnailUri = Uri.fromFile(ThumbnailFile);
                                if (isConnectedToRealm && isConnectedToCloudinary && app!=null) uploadImage(thumbnailUri,uri,mp,nextButton,currFragInst);
                                else Toast.makeText(getActivity(),"You are not Connected to backend. please retry!",Toast.LENGTH_SHORT).show();
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

