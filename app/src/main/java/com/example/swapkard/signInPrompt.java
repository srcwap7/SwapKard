package com.example.swapkard;

import android.os.Bundle;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import org.bson.Document;

import java.util.Arrays;
import java.util.List;

import io.realm.Realm;
import io.realm.mongodb.App;
import io.realm.mongodb.AppConfiguration;
import io.realm.mongodb.Credentials;
import io.realm.mongodb.User;
import io.realm.mongodb.functions.Functions;
/**
 * A simple {@link Fragment} subclass.
 * Use the {@link signInPrompt#newInstance} factory method to
 * create an instance of this fragment.
 */
public class signInPrompt extends Fragment {

    private static App app;


    public signInPrompt() {
        // Required empty public constructor
    }

    public static signInPrompt newInstance() {
        signInPrompt fragment = new signInPrompt();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getContext()!=null) Realm.init(getContext());
        app = new App(new AppConfiguration.Builder(UserSignUpTools.getRealmAppId()).build());
        app.loginAsync(Credentials.anonymous(), new App.Callback<User>() {
            @Override
            public void onResult(App.Result<User> result) {
                if (result.isSuccess()) Log.d("AsyncLogin","Logged In");
                else{
                    Log.e("AsyncLogin","Log In failed");
                }
            }
        });
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view= inflater.inflate(R.layout.fragment_sign_in_prompt, container, false);
        Button NextButton = view.findViewById(R.id.phoneNoNextButton2);
        NextButton.setOnClickListener(v->{
            NextButton.setEnabled(false);
            Functions myFunction = app.currentUser().getFunctions();
            EditText phoneNoField = view.findViewById(R.id.phoneNoField2);
            String phoneNo = phoneNoField.getText().toString().trim();
            List<String> args = Arrays.asList(phoneNo);
            myFunction.callFunctionAsync("LookForPhoneNo",args,Document.class,result->{
                if (result.isSuccess()){
                    Log.d("AsyncFind","Executed");
                    Document doc = result.get();
                    if (doc.containsKey("Status")){
                        String x = doc.getString("Status");
                        if (x.equals("Present")){
                            Log.d("AsyncFind","PhoneNoMatched");
                            String Salt=doc.getString("Salt");
                            String Password=doc.getString("Hashed_password");
                            FragmentTransaction loadPassword = getActivity().getSupportFragmentManager().beginTransaction();
                            loadPassword.replace(R.id.fragment_username_prompt,signInPassword.newInstance(Salt,Password));
                            loadPassword.addToBackStack(null);
                            loadPassword.commit();
                        }
                        else{
                            UserSignUpTools.showAlert(this,"Entered PhoneNo not registered");
                            NextButton.setEnabled(true);
                        }
                    }
                    else{
                        UserSignUpTools.showAlert(this,"Fatal error: Connection not found");
                        NextButton.setEnabled(true);
                    }
                }
                else{
                    NextButton.setEnabled(true);
                    Log.e("AsyncFind","Error in connection");
                    UserSignUpTools.showAlert(this,"We failed to connect to cloud");
                }
            });
        });
        Button prev = view.findViewById(R.id.prevButton2);
        prev.setOnClickListener(v->{
            UserSignUpTools.previousTransaction(this);
        });
        return view;
    }
}