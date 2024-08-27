package com.example.swapkard;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.os.Bundle;

import androidx.fragment.app.Fragment;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.util.Base64;

import com.cloudinary.android.MediaManager;
import com.google.android.material.textfield.TextInputEditText;
import com.google.gson.Gson;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;

import org.bson.Document;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link signInPassword#newInstance} factory method to
 * create an instance of this fragment.
 */
public class signInPassword extends Fragment {
    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";

    private static final String ARG_PARAM3 = "param3";

    private static final String ARG_PARAM4 = "param4";

    private static final String ARG_PARAM5 = "param5";
    private static final String ARG_PARAM6 = "param6";

    private static final String ARG_PARAM7 = "param7";

    private static final String ARG_PARAM8 = "param8";

    private static final String ARG_PARAM9 = "param9";

    private static final String ARG_PARAM10 = "param10";

    private String mParam1;
    private String mParam2, mParam3, mParam4, mParam5, mParam6, mParam9,mParam10;

    private ArrayList<Document> mParam7, mParam8;

    private static Integer count;

    public signInPassword() {
        // Required empty public constructor
    }

    // TODO: Rename and change types and number of parameters
    public static signInPassword newInstance(String Salt, String Password, String UserFirstName, String UserLastName, String UserId, String PhoneNo, ArrayList<Document> pending_invites, ArrayList<Document> connections, String cloudinaryId,String thumbnailId) {
        signInPassword fragment = new signInPassword();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, Salt);
        args.putString(ARG_PARAM2, Password);
        args.putString(ARG_PARAM3, UserFirstName);
        args.putString(ARG_PARAM4, UserLastName);
        args.putString(ARG_PARAM5, UserId);
        args.putString(ARG_PARAM6, PhoneNo);
        args.putSerializable(ARG_PARAM7, pending_invites);
        args.putSerializable(ARG_PARAM8, connections);
        args.putString(ARG_PARAM9, cloudinaryId);
        args.putString(ARG_PARAM10,thumbnailId);
        fragment.setArguments(args);
        return fragment;
    }

    @SuppressWarnings("unchecked")

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            mParam1 = getArguments().getString(ARG_PARAM1);
            mParam2 = getArguments().getString(ARG_PARAM2);
            mParam3 = getArguments().getString(ARG_PARAM3);
            mParam4 = getArguments().getString(ARG_PARAM4);
            mParam5 = getArguments().getString(ARG_PARAM5);
            mParam6 = getArguments().getString(ARG_PARAM6);
            mParam7 = (ArrayList<Document>) getArguments().getSerializable(ARG_PARAM7);
            mParam8 = (ArrayList<Document>) getArguments().getSerializable(ARG_PARAM8);
            mParam9 = getArguments().getString(ARG_PARAM9);
            mParam10 = getArguments().getString(ARG_PARAM10);
            if (mParam2 == null) {
                Log.e("login", "null");
            }
        }
        count = 0;
    }

    public void initializeDirectories(ArrayList<Document> arrayList, String name) {
        File directory = new File(getActivity().getApplicationContext().getFilesDir(), name);
        boolean isCreated = directory.mkdir();
        File profiles = new File(directory,"ProfilePictures");
        boolean isSubDirectoryCreated = profiles.mkdir();
        if (isCreated && isSubDirectoryCreated) {
            for (int i = 0; i < arrayList.size(); i++) {
                org.bson.Document res = arrayList.get(i);
                String cloudinaryId = res.getString("senderCloudinaryId");
                String userId = res.getString("senderId");
                String thumbnailId = res.getString("senderThumbnailId");
                String url = MediaManager.get().url().generate(cloudinaryId);
                String thumbnailUri = MediaManager.get().url().generate(thumbnailId);
                    Picasso.get().load(thumbnailUri).into(new Target() {
                        @Override
                        public void onBitmapLoaded(Bitmap bitmap, Picasso.LoadedFrom from) {
                            Log.d("ProfilePictures", profiles.getAbsolutePath());
                            File file = new File(profiles, userId + ".png");
                            try {
                                FileOutputStream fileOutputStream = new FileOutputStream(file);
                                bitmap.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream);
                            } catch (Exception e) {
                                Log.e("FileLoader", "Error in downloading profile pictures");
                            }
                        }

                        @Override
                        public void onBitmapFailed(Exception e, Drawable errorDrawable) {

                        }

                        @Override
                        public void onPrepareLoad(Drawable placeHolderDrawable) {

                        }
                    });
                    Picasso.get().load(url).into(new Target() {
                        @Override
                        public void onBitmapLoaded(Bitmap bitmap, Picasso.LoadedFrom from) {
                            try {
                                String fileName = userId + ".png";
                                File file = new File(directory, fileName);
                                FileOutputStream fileOutputStream = new FileOutputStream(file);
                                bitmap.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream);
                            } catch (IOException e) {
                                Log.e("FetchingCards", "Disk Error " + e.getMessage());
                            }
                        }

                        @Override
                        public void onBitmapFailed(Exception e, Drawable errorDrawable) {

                        }

                        @Override
                        public void onPrepareLoad(Drawable placeHolderDrawable) {

                        }
                    });
            }
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_sign_in_password, container, false);
        Button nextButton = view.findViewById(R.id.passwordNextButton2);
        TextInputEditText passwordField = view.findViewById(R.id.signInPasswordField);
        nextButton.setOnClickListener(v -> {
            if (count < 3) {
                count++;
                nextButton.setEnabled(false);
                String password = passwordField.getText().toString().trim();
                byte[] x = password.getBytes(StandardCharsets.UTF_8);
                byte[] y = Base64.decode(mParam1, Base64.DEFAULT);
                byte[] finalByte = new byte[x.length + y.length];
                System.arraycopy(y, 0, finalByte, 0, y.length);
                System.arraycopy(x, 0, finalByte, y.length, x.length);
                MessageDigest digestInstance = null;
                try {
                    digestInstance = MessageDigest.getInstance("SHA-256");
                    byte[] byteArray = digestInstance.digest(finalByte);
                    StringBuilder checksum = new StringBuilder(2 * byteArray.length);
                    for (int i = 0; i < byteArray.length; i++) {
                        String hex = Integer.toHexString(0xff & byteArray[i]);
                        if (hex.length() == 1) checksum.append('0');
                        checksum.append(hex);
                    }
                    String fs = checksum.toString();
                    if (mParam2.equals(fs)) {
                        QRCodeWriter qrCodeWriter = new QRCodeWriter();
                        try {
                            ExecutorService executorService = Executors.newFixedThreadPool(3);
                            Runnable loadQRCode = new Runnable() {
                                @Override
                                public void run() {
                                    try {
                                        BitMatrix bitMatrix = qrCodeWriter.encode(mParam5, BarcodeFormat.QR_CODE, 500, 500);
                                        int height = bitMatrix.getHeight();
                                        int width = bitMatrix.getWidth();
                                        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
                                        for (int i = 0; i < width; i++) {
                                            for (int j = 0; j < height; j++) {
                                                if (bitMatrix.get(i, j))
                                                    bitmap.setPixel(i, j, Color.BLACK);
                                                else bitmap.setPixel(i, j, Color.WHITE);
                                            }
                                        }
                                        File directory = null;
                                        if (getActivity() != null)
                                            directory = getActivity().getFilesDir();
                                        File filepath = new File(directory, "qrcode.png");
                                        FileOutputStream fos = null;
                                        try {
                                            fos = new FileOutputStream(filepath);
                                            bitmap.compress(Bitmap.CompressFormat.PNG, 100, fos);
                                        } catch (FileNotFoundException e) {
                                            String err = e.getMessage();
                                            if (err != null)
                                                Log.e("QRCodeWriter", "File Not Found Exception");
                                        }
                                    } catch (Exception e) {
                                        Log.e("QRCodeGenerator", "Error In generating QR code " + e.getMessage());
                                    }
                                }
                            };
                            Runnable loadPendingInvites = new Runnable() {
                                @Override
                                public void run() {
                                    initializeDirectories(mParam7, "pendingInvites");
                                }
                            };
                            Runnable loadConnections = new Runnable() {
                                @Override
                                public void run() {
                                    initializeDirectories(mParam8, "connections");
                                }
                            };
                            executorService.execute(loadQRCode);
                            Handler handler = new Handler(Looper.getMainLooper());
                            handler.post(loadPendingInvites);
                            handler.post(loadConnections);
                            if (getActivity() != null) {
                                SharedPreferences sharedPreferences = getActivity().getSharedPreferences("UserMetaDetails", Context.MODE_PRIVATE);
                                SharedPreferences.Editor editor = sharedPreferences.edit();
                                String pendingInvitesBson = new Gson().toJson(mParam7);
                                String connectionsBson = new Gson().toJson(mParam8);
                                editor.putString("UserFirstName", mParam3);
                                editor.putString("UserLastName", mParam4);
                                editor.putString("UserId", mParam5);
                                editor.putString("Salt", mParam1);
                                editor.putString("Password", mParam2);
                                editor.putBoolean("isSignedUp", true);
                                editor.putString("phoneNo", mParam6);
                                editor.putString("PendingInvites", pendingInvitesBson);
                                editor.putString("Connections", connectionsBson);
                                editor.putString("CloudinaryId", mParam9);
                                editor.putString("ThumbnailId",mParam10);
                                Log.e("CloudinaryId",mParam9 + " " + mParam10);
                                editor.apply();
                            }
                            Intent launchHome = new Intent(getContext(), MainActivity.class);
                            launchHome.putExtra("cloudinaryInitialization", true);
                            startActivity(launchHome);
                            if (getActivity() != null) getActivity().finish();
                            else {
                                Log.e("Login", "Failed");
                                UserSignUpTools.showAlert(this, "Wrong Password! Retry");
                                nextButton.setEnabled(true);
                            }
                        }
                        catch (Exception e){
                            Log.d("AppSetup","SetUp Failed.");
                        }
                    } else {
                        nextButton.setEnabled(false);
                        UserSignUpTools.showAlert(this, "You have exhausted login Attempts");
                    }
                }
                catch (NoSuchAlgorithmException e) {
                    Log.e("NoSuchAlgorithmException", "No Such Algorithm exists " + e.getMessage());
                }
            }
        });
        return view;
    }
}