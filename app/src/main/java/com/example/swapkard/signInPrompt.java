package com.example.swapkard;

import android.graphics.Bitmap;
import android.graphics.drawable.Drawable;
import android.os.Bundle;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import com.cloudinary.android.MediaManager;
import com.google.android.material.textfield.TextInputEditText;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;

import org.bson.Document;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
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
        Fragment fr = this;
        app.loginAsync(Credentials.anonymous(), new App.Callback<User>() {
            @Override
            public void onResult(App.Result<User> result) {
                if (result.isSuccess()) {
                    Log.d("AsyncLogin","Logged In");
                }
                else{
                    Log.e("AsyncLogin","Log In failed");
                    UserSignUpTools.showAlert(fr,"Check your network settings and connection");
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
            if (((SignUp)getActivity()).checkRealmConnection()) {
                Functions myFunction = app.currentUser().getFunctions();
                TextInputEditText phoneNoField = view.findViewById(R.id.phoneNoField2);
                String phoneNo = phoneNoField.getText().toString().trim();
                List<String> args = Arrays.asList(phoneNo);
                myFunction.callFunctionAsync("LookForPhoneNo", args, Document.class, result -> {
                    if (result.isSuccess()) {
                        Log.d("AsyncFind", "Executed");
                        Document doc = result.get();
                        if (doc.containsKey("Status")) {
                            String x = doc.getString("Status");
                            if (x.equals("Present")) {
                                Log.d("AsyncFind", "PhoneNoMatched");
                                String UserFirstName = doc.getString("UserFirstName");
                                String UserLastname = doc.getString("UserLastName");
                                String UserId = doc.getString("UserId");
                                String Salt = doc.getString("Salt");
                                String Password = doc.getString("Hashed_password");
                                String cloudinaryId = doc.getString("Cloudinary_Id");
                                String thumbnailId=doc.getString("Thumbnail_Id");
                                if (((SignUp) getActivity()).checkCloudinaryConnection()) {
                                    String url = MediaManager.get().url().generate(cloudinaryId);
                                    Picasso.get().load(url).into(
                                            new Target() {
                                                @Override
                                                public void onBitmapLoaded(Bitmap bitmap, Picasso.LoadedFrom from) {
                                                    try {
                                                        File directory = getContext().getFilesDir();
                                                        File file = new File(directory, "card.png");
                                                        FileOutputStream fileOutputStream = new FileOutputStream(file);
                                                        bitmap.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream);
                                                    } catch (IOException e) {
                                                        String err = e.getMessage();
                                                        Log.e("ImageWriter", "Operation failed " + err);
                                                        getActivity().finish();
                                                    }
                                                }

                                                @Override
                                                public void onBitmapFailed(Exception e, Drawable errorDrawable) {

                                                }

                                                @Override
                                                public void onPrepareLoad(Drawable placeHolderDrawable) {

                                                }
                                            }
                                    );
                                }
                                ArrayList<Document> pending_invites = (ArrayList<Document>) doc.get("Pending_Invites");
                                ArrayList<Document> connections = (ArrayList<Document>) doc.get("Connections");
                                FragmentTransaction loadPassword = getActivity().getSupportFragmentManager().beginTransaction();
                                loadPassword.replace(R.id.fragment_username_prompt, signInPassword.newInstance(Salt, Password, UserFirstName, UserLastname, UserId, phoneNo, pending_invites, connections, cloudinaryId,thumbnailId));
                                loadPassword.addToBackStack(null);
                                loadPassword.commit();
                            } else {
                                UserSignUpTools.showAlert(this, "Entered PhoneNo not registered");
                                NextButton.setEnabled(true);
                            }
                        } else {
                            UserSignUpTools.showAlert(this, "Fatal error: Connection not found");
                            NextButton.setEnabled(true);
                        }
                    } else {
                        NextButton.setEnabled(true);
                        Log.e("AsyncFind", "Error in connection");
                        UserSignUpTools.showAlert(this, "We failed to connect to cloud");
                    }
                });
            }
            else{
                NextButton.setEnabled(true);
                Log.d("AsyncFind","Not Connected To Realm");
                UserSignUpTools.showAlert(this,"You are not connected to Internet");
            }
        });
        Button prev = view.findViewById(R.id.prevButton2);
        prev.setOnClickListener(v->{
            UserSignUpTools.previousTransaction(this);
        });
        return view;
    }
}