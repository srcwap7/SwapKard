package com.example.swapkard;

import android.content.Intent;
import android.os.Bundle;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import android.util.Base64;

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

    private String mParam1;
    private String mParam2;

    private static Integer count;
    public signInPassword() {
        // Required empty public constructor
    }

    // TODO: Rename and change types and number of parameters
    public static signInPassword newInstance(String Salt, String Password) {
        signInPassword fragment = new signInPassword();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, Salt);
        args.putString(ARG_PARAM2, Password);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            mParam1 = getArguments().getString(ARG_PARAM1);
            mParam2 = getArguments().getString(ARG_PARAM2);
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