package com.example.swapkard;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.journeyapps.barcodescanner.ScanContract;
import com.journeyapps.barcodescanner.ScanOptions;

import org.bson.Document;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.realm.Realm;
import io.realm.mongodb.App;
import io.realm.mongodb.AppConfiguration;
import io.realm.mongodb.Credentials;
import io.realm.mongodb.User;
import io.realm.mongodb.functions.Functions;

public class HomeScreenCumRedirectToSignUp extends AppCompatActivity {
    private int status;
    private String id,password;
    private ActivityResultLauncher<Intent> qrCodeScanner;
    private App app;

    private void performRealmLogin(Context context,boolean flag,String qrcode){
        if (UserSignUpTools.isInternetAvailable(context)) {
            Realm.init(context);
            SharedPreferences sharedPreferences = getSharedPreferences("UserMetaDetails", MODE_PRIVATE);
            password = sharedPreferences.getString("Password", "noPassword");
            id = sharedPreferences.getString("UserId", "notPresent");
            app = new App(new AppConfiguration.Builder(UserSignUpTools.getRealmAppId()).build());
            Document doc = new Document("id", id).append("password", password);
            Credentials cred = Credentials.customFunction(doc);
            app.loginAsync(cred, result -> {
                    if (result.isSuccess()) {
                        status = 1;
                        if (flag) sendConnectionRequest(qrcode,id);
                        Log.d("Login", "Logged in successfully. Auth ok");
                    } else {
                        status = 2;
                        Log.e("Login", "Auth failed");
                    }
            });
        }
        else{
            Toast.makeText(context,"Please Check Internet Connection", Toast.LENGTH_SHORT).show();
            Log.e("Login","Internet Error!");
        }
    }

    private void sendConnectionRequest(String qrcode,String id){
        User curr = app.currentUser();
        Functions func = curr.getFunctions();
        List<Object> args = Arrays.asList(qrcode, id);
        func.callFunctionAsync("sendRequest", args, Document.class, result1 -> {
                    if (result1.isSuccess()) {
                        Document details = result1.get();
                        String status = details.getString("status");
                        if (status.equals("Success"))  Log.d("sendRequestHandler", "Boom! you have done great");
                        else{
                            Toast.makeText(getApplicationContext(),"Some Error occurred",Toast.LENGTH_SHORT).show();
                            Log.e("sendRequestHandler","Error in sending request");
                        }

                    } else{
                        Log.e("sendRequestHandler", "Unexpected error");
                        Toast.makeText(getApplicationContext(),"check your connection!",Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        this.status = 0;
        SharedPreferences userMetaDetails = getSharedPreferences("UserMetaDetails", MODE_PRIVATE);
        boolean sessionSet = userMetaDetails.getBoolean("isSignedUp", false);
        if (!sessionSet) {
            Intent redirectToSignUp = new Intent(HomeScreenCumRedirectToSignUp.this, SignUp.class);
            startActivity(redirectToSignUp);
            finish();
        }

        Context context = getApplicationContext();
        Runnable performLoginOnEntry = new Runnable() {
                @Override
                public void run() {
                    performRealmLogin(context,false,null);
                }
        };
        ExecutorService executors = Executors.newSingleThreadExecutor();
        Handler handler = new Handler(Looper.getMainLooper());
        executors.execute(new Runnable() {
            @Override
            public void run() {
                handler.post(performLoginOnEntry);
            }
        });
        qrCodeScanner = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> {
                        if (result.getResultCode() == Activity.RESULT_OK) {
                            Bundle extras = result.getData().getExtras();
                            String qrcode = extras.getString("SCAN_RESULT");
                            if (status == 0){
                                executors.execute(new Runnable() {
                                    @Override
                                    public void run() {
                                        handler.post(new Runnable() {
                                            @Override
                                            public void run() {
                                                performRealmLogin(context,true,qrcode);
                                            }
                                        });
                                    }
                                });
                            }
                            if (status==1) {
                                executors.execute(new Runnable() {
                                    @Override
                                    public void run() {
                                        handler.post(new Runnable() {
                                            @Override
                                            public void run() {
                                                sendConnectionRequest(qrcode,id);
                                            }
                                        });
                                    }
                                });
                            }
                            else{
                                //UserSignUpTools.showAlertActivity(getApplicationContext(),"Seems like an exception occurred!Check your Internet Connection");
                            }
                        }
                    }
            );
            setContentView(R.layout.activity_home_screen_cum_redirect_to_sign_up);
            File qrfile = new File(getFilesDir(), "qrcode.png");
            Bitmap bmp = BitmapFactory.decodeFile(qrfile.getAbsolutePath());
            ImageView imageView = findViewById(R.id.imageview);
            if (bmp != null) imageView.setImageBitmap(bmp);
            Button scan = findViewById(R.id.scanQR);
            scan.setOnClickListener(v -> {
                qrCodeScanner.launch(new ScanContract().createIntent(getApplicationContext(), new ScanOptions()));
            });
            Button viewRequest = findViewById(R.id.viewRequests);
            viewRequest.setOnClickListener(
                    v->{
                        Intent newIntent = new Intent(getApplicationContext(),viewRequests.class);
                        startActivity(newIntent);
                        finish();
                    }
            );
            ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
                Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
                return insets;
            });

    }
}