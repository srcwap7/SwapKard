package com.example.swapkard;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import android.os.CountDownTimer;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.PhoneAuthCredential;
import com.google.firebase.auth.PhoneAuthProvider;

import java.util.HashMap;


public class otpEntry extends Fragment {

    private static final String param1 = "verificationId";
    private static final String param2 = "phoneNo";
    private static final String param3 = "HashMap";
    private static String mParam2;
    private static String mParam1;
    private static HashMap<String,String> mp;
    private static FirebaseAuth authInst;
    public otpEntry() {
        // Required empty public constructor
    }

    public static otpEntry newInstance(@NonNull String verificationId, @NonNull String PhoneNo, HashMap<String,String>map) {
        otpEntry fragment = new otpEntry();
        Bundle args = new Bundle();
        args.putString(param1,verificationId);
        args.putString(param2,PhoneNo);
        args.putSerializable(param3,map);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    @SuppressWarnings("unchecked")
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Bundle info = getArguments();
        if (info != null) {
            mParam1 = info.getString(param1);
            mParam2 = info.getString(param2);
            mp = (HashMap<String, String>)info.getSerializable(param3);
        }
        authInst=FirebaseAuth.getInstance();
    }

    private void signInWithCredential(PhoneAuthCredential credentials){
        Fragment currFragmentInstance = this;
        authInst.signInWithCredential(credentials).addOnCompleteListener(new OnCompleteListener<AuthResult>() {
            @Override
            public void onComplete(@NonNull Task<AuthResult> task) {
                if (task.isSuccessful()){
                    if (getActivity()!=null) {
                        mp.put("PhoneNo", mParam2);
                        FragmentManager fragmentManager = getActivity().getSupportFragmentManager();
                        FragmentTransaction onSuccessfulOTPVerification = fragmentManager.beginTransaction();
                        onSuccessfulOTPVerification.replace(R.id.fragment_username_prompt, passowrdFragment.newInstance(mp));
                        onSuccessfulOTPVerification.commit();
                    }
                    else{
                        UserSignUpTools.showAlert(currFragmentInstance,"Sorry Fragment Manager misbehaved!");
                    }
                }
                else{
                    UserSignUpTools.showAlert(currFragmentInstance,"Please check the otp you received and retry");
                    if (getActivity()!=null) (getActivity().getWindow().getDecorView().getRootView().findViewById(R.id.otpVerificationProceed)).setEnabled(true);
                }
            }
        });
    }
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_otp_entry, container, false);
        Button otpVerifyButton = view.findViewById(R.id.otpVerificationProceed);
        otpVerifyButton.setOnClickListener( v -> {
                otpVerifyButton.setEnabled(false);
                String code = ((EditText)view.findViewById(R.id.digit)).getText().toString().trim();
                PhoneAuthCredential credentials = PhoneAuthProvider.getCredential(mParam1,code);
                signInWithCredential(credentials);
            }
        );
        TextView timerTextView = view.findViewById(R.id.secondsRemaining);
        new CountDownTimer(60000, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                timerTextView.setText(String.valueOf(millisUntilFinished / 1000));
            }
            @Override
            public void onFinish() {
                Button resendButton = view.findViewById(R.id.otpResend);
                resendButton.setEnabled(true);
            }
        }.start();
        Button abortion = view.findViewById(R.id.otpVerificationAbort);
        abortion.setOnClickListener(
                v -> UserSignUpTools.previousTransaction(this)
        );
        Button resendButton = view.findViewById(R.id.otpResend);
        resendButton.setOnClickListener(
            v -> UserSignUpTools.beginFirebaseOTPTransaction(mParam2,this,false,mp)
        );
        return view;
    }
}