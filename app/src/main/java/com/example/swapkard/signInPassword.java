package com.example.swapkard;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Bundle;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.provider.ContactsContract;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import android.util.Base64;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

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

    private String mParam1;
    private String mParam2,mParam3,mParam4,mParam5,mParam6;

    private static Integer count;
    public signInPassword() {
        // Required empty public constructor
    }

    // TODO: Rename and change types and number of parameters
    public static signInPassword newInstance(String Salt, String Password,String UserFirstName,String UserLastName,String UserId,String PhoneNo) {
        signInPassword fragment = new signInPassword();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, Salt);
        args.putString(ARG_PARAM2, Password);
        args.putString(ARG_PARAM3,UserFirstName);
        args.putString(ARG_PARAM4,UserLastName);
        args.putString(ARG_PARAM5,UserId);
        args.putString(ARG_PARAM6,PhoneNo);
        fragment.setArguments(args);
        return fragment;
    }

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
            if (mParam2==null){
                Log.e("login","null");
            }
        }
        count=0;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_sign_in_password, container, false);
        Button nextButton = view.findViewById(R.id.passwordNextButton2);
        EditText passwordField = view.findViewById(R.id.signInPasswordField);
        nextButton.setOnClickListener(v->{
            if (count<3) {
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
                            BitMatrix bitMatrix = qrCodeWriter.encode(mParam5, BarcodeFormat.QR_CODE, 500, 500);
                            int height = bitMatrix.getHeight();
                            int width = bitMatrix.getWidth();
                            Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
                            for (int i = 0; i < width; i++) {
                                for (int j = 0; j < height; j++) {
                                    if (bitMatrix.get(i, j)) bitmap.setPixel(i, j, Color.BLACK);
                                    else bitmap.setPixel(i, j, Color.WHITE);
                                }
                            }
                            File directory = null;
                            if (getActivity()!=null) directory = getActivity().getFilesDir();
                            File filepath = new File(directory,"qrcode.png");
                            FileOutputStream fos = null;
                            try{
                                fos = new FileOutputStream(filepath);
                                bitmap.compress(Bitmap.CompressFormat.PNG,100,fos);
                            }
                            catch(FileNotFoundException e){
                                String err = e.getMessage();
                                if (err!=null) Log.e("QRCodeWriter","File Not Found Exception");
                            }
                        }
                        catch(WriterException e){
                            String err = e.getMessage();
                            if (err!=null) Log.e("Login",err);
                        }
                        if (getActivity()!=null) {
                            SharedPreferences sharedPreferences = getActivity().getSharedPreferences("UserMetaDetails", Context.MODE_PRIVATE);
                            SharedPreferences.Editor editor = sharedPreferences.edit();
                            editor.putString("UserFirstName",mParam3);
                            editor.putString("UserLastName",mParam4);
                            editor.putString("UserId",mParam5);
                            editor.putString("Salt",mParam1);
                            editor.putString("Password",mParam2);
                            editor.putBoolean("isSignedUp",true);
                            editor.putString("phoneNo",mParam6);
                            editor.apply();
                        }
                        Intent launchHome = new Intent(getContext(), HomeScreenCumRedirectToSignUp.class);
                        startActivity(launchHome);
                        if (getActivity() != null) getActivity().finish();
                    } else {
                        Log.e("Login", "Failed");
                        UserSignUpTools.showAlert(this, "Wrong Password! Retry");
                        nextButton.setEnabled(true);
                    }
                } catch (NoSuchAlgorithmException e) {
                    throw new RuntimeException(e);
                }
            }
            else{
                nextButton.setEnabled(false);
                UserSignUpTools.showAlert(this,"You have exhausted login Attempts");
            }
        });
        return view;
    }
}