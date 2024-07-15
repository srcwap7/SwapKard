package com.example.swapkard;

import android.os.Bundle;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import java.util.HashMap;

public class UsernamePrompt extends Fragment {
    HashMap<String,String> mp;
    private static final String ARG1 = "HashMap";
    public UsernamePrompt() {
        // EMPTY CONSTRUCTOR
    }

    public static UsernamePrompt newInstance(HashMap<String,String> map) {
        UsernamePrompt fragment = new UsernamePrompt();
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
        if (info!=null){
            mp = (HashMap<String,String>)info.getSerializable(ARG1);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_username_prompt, container, false);
        Button nextbutton = view.findViewById(R.id.JumpToPhoneNo);
        nextbutton.setOnClickListener( v -> {
                    EditText userFirstNameField = view.findViewById(R.id.userFirstNameField);
                    String userFirstName = userFirstNameField.getText().toString().trim();
                    EditText userLastNameField = view.findViewById(R.id.userLastNameField);
                    String userLastName = userLastNameField.getText().toString().trim();
                    boolean flag = true;
                    if (userFirstName.isEmpty() || userLastName.isEmpty()) UserSignUpTools.showAlert(this, "Your first or last name cant be empty");
                    else {
                        for (int i = 0; i < userFirstName.length(); i++) {
                            char x = userFirstName.charAt(i);
                            if (x < 'A' || x > 'z' || (x > 'Z' && x < 'a')) {
                                flag = false;
                                break;
                            }
                        }
                        if (!flag) UserSignUpTools.showAlert(this, "Name Cannot contain Numbers or Special Characters");
                        else {
                            boolean newFlag = true;
                            for (int i = 0; i < userLastName.length(); i++) {
                                char x = userLastName.charAt(i);
                                if (x < 'A' || x > 'z' || (x > 'Z' && x < 'a')) {
                                    newFlag = false;
                                    break;
                                }
                            }
                            if (!newFlag) UserSignUpTools.showAlert(this, "Name Cannot contain Numbers or Special Characters");
                            else {
                                mp.put("UserFirstName", userFirstName);
                                mp.put("UserLastName", userLastName);
                                if (getActivity() != null) {
                                    FragmentTransaction phoneNoLoader = getActivity().getSupportFragmentManager().beginTransaction();
                                    PhoneNoPrompt phoneNoPrompt = PhoneNoPrompt.newInstance(mp);
                                    phoneNoLoader.replace(R.id.fragment_username_prompt, phoneNoPrompt);
                                    phoneNoLoader.addToBackStack(null);
                                    phoneNoLoader.commit();
                                }
                            }
                        }
                    }
                }
        );
        Button jumpToSignUp = (Button)view.findViewById(R.id.signIn);
        jumpToSignUp.setOnClickListener((v -> {
                FragmentTransaction signInLoader = getActivity().getSupportFragmentManager().beginTransaction();
                signInLoader.replace(R.id.fragment_username_prompt,signInPrompt.newInstance());
                signInLoader.addToBackStack(null);
                signInLoader.commit();
        }));
        return view;
    }
}