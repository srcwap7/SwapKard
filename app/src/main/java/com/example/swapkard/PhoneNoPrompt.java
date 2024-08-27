package com.example.swapkard;

import android.app.AlertDialog;
import android.os.Bundle;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.auth.FirebaseAuth;

import org.bson.Document;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;

import io.realm.mongodb.App;
import io.realm.mongodb.User;
import io.realm.mongodb.functions.Functions;

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
        FirebaseAuth mAuth=FirebaseAuth.getInstance();
        mAuth.signInAnonymously();
        nextbutton.setOnClickListener(
                v -> {
                    nextbutton.setEnabled(false);
                    TextInputEditText PhoneNoField = view.findViewById(R.id.phoneNoField);
                    String PhoneNo = PhoneNoField.getText().toString().trim();
                    boolean isConnectedToRealm = ((SignUp)getActivity()).checkRealmConnection();
                    if (isConnectedToRealm){
                        App app = ((SignUp)getActivity()).getApp();
                        User user = app.currentUser();
                        Functions functions = user.getFunctions();
                        List<Object> list = Arrays.asList(PhoneNo);
                        Log.d("PhoneNoPresentChecker","Start Verification!"+user.getId());
                        functions.callFunctionAsync("searchForPhoneNo",list, Document.class, result ->{
                            if (result.isSuccess()){
                                org.bson.Document x = (org.bson.Document) result.get();
                                mp.put("PhoneNo",PhoneNo);
                                String status = x.getString("Status");
                                if (status.equals("Present")){
                                    AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
                                    builder.setTitle("Account Exists");
                                    builder.setMessage("Want to login to the account?");
                                    builder.setPositiveButton("Ok", ((dialog, which) -> {
                                        FragmentTransaction redirectToLogin = getActivity().getSupportFragmentManager().beginTransaction();
                                        redirectToLogin.replace(R.id.fragment_username_prompt, signInPrompt.newInstance());
                                        redirectToLogin.commit();
                                    }));
                                    builder.setNegativeButton("Back To SignUp", ((dialog, which) -> {
                                        FragmentTransaction redirectToSignUp = getActivity().getSupportFragmentManager().beginTransaction();
                                        HashMap<String, String> map = new HashMap<>();
                                        redirectToSignUp.replace(R.id.fragment_username_prompt, UsernamePrompt.newInstance(map));
                                        redirectToSignUp.commit();
                                    }));
                                    builder.show();
                                }
                                else UserSignUpTools.beginFirebaseOTPTransaction(PhoneNo, this, true,mp);
                            }
                            else{
                                nextbutton.setEnabled(true);
                                Log.e("PhoneNoPresentChecker","Error In Connection! "+result.getError());
                                UserSignUpTools.showAlert(this,"Please check if you are connected");
                            }
                        });
                    }
                }
        );
        Button prevbutton = view.findViewById(R.id.prevButton);
        prevbutton.setOnClickListener(
                v -> UserSignUpTools.previousTransaction(this)
        );
        return view;
    }
}