package com.example.swapkard;

import android.os.Bundle;

import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import com.google.firebase.auth.FirebaseAuth;

import java.util.HashMap;

public class PhoneNoPrompt extends Fragment {

    HashMap<String,String> mp;
    private static final String ARG1 = "HashMap";
    public PhoneNoPrompt() {
        //EMPTY CONSTRUCTOR
    }


    public static PhoneNoPrompt newInstance(HashMap<String,String> map) {
        PhoneNoPrompt fragment = new PhoneNoPrompt();
        Bundle args = new Bundle();
        args.putSerializable(ARG1,map);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    @SuppressWarnings("unchecked")
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Bundle info = getArguments();
        if (info != null){
            mp = (HashMap<String,String>)info.getSerializable(ARG1);
        }
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view =  inflater.inflate(R.layout.fragment_phoneno_prompt, container, false);
        Button nextbutton = view.findViewById(R.id.phoneNoNextButton);
        FirebaseAuth.getInstance();
        nextbutton.setOnClickListener(
                v -> {
                    nextbutton.setEnabled(false);
                    EditText PhoneNoField = view.findViewById(R.id.phoneNoField);
                    String PhoneNo = PhoneNoField.getText().toString().trim();
                    UserSignUpTools.beginFirebaseOTPTransaction(PhoneNo, this, true,mp);
                }
        );
        Button prevbutton = view.findViewById(R.id.prevButton);
        prevbutton.setOnClickListener(
                v -> UserSignUpTools.previousTransaction(this)
        );
        return view;
    }
}