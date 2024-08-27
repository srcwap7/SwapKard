package com.example.swapkard;


import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
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
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.journeyapps.barcodescanner.ScanContract;
import com.journeyapps.barcodescanner.ScanOptions;

import org.bson.Document;

import java.io.File;
import java.io.FileNotFoundException;
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
public class HomeScreenCumRedirectToSignUp extends AppCompatActivity {
    private int status;
    private String id;
    private String password;
    private ActivityResultLauncher<Intent> qrCodeScanner;
    private static App app;

    private boolean isConnected;

    private ServiceConnection serviceConnection;

    private String cloudinaryId;

    private FetchRequests fetchRequests;

    private BroadcastReceiver upDateReceiver;

    private Intent serviceIntent;

    private ArrayList<ArrayList<String>> pending_invites;

    private ArrayList<ArrayList<String>> connections;


    private Activity activity;

    private boolean cloudinaryInitialization;

    private Handler handler;

    private BroadcastReceiver broadcastReceiver;


    public static App getApp(){
        return app;
    }

    private void performRealmLogin(Context context){
        if (UserSignUpTools.isInternetAvailable(context)) {
            Realm.init(context);
            app = new App(new AppConfiguration.Builder(UserSignUpTools.getRealmAppId()).build());
            Document doc = new Document("id", id).append("password", password);
            Credentials cred = Credentials.customFunction(doc);
            app.loginAsync(cred, result -> {
                    if (result.isSuccess()) {
                        User authRes = result.get();
                        if (authRes.getId().equals("NotFound")){
                            status=0;
                            Handler handler = new Handler(Looper.getMainLooper());
                            handler.post(new Runnable() {
                                @Override
                                public void run() {
                                    Toast.makeText(getApplicationContext(),"Failed To Login",Toast.LENGTH_SHORT).show();
                                }
                            });
                            Toast.makeText(getApplicationContext(),"Failed To LogIn",Toast.LENGTH_SHORT).show();
                        }
                        else {
                            status = 1;
                            serviceConnection = new ServiceConnection() {
                                @Override
                                public void onServiceConnected(ComponentName name, IBinder service) {
                                    Log.d("ServiceConnector", "Connected");
                                    isConnected = true;
                                    FetchRequests.LocalBinder localBinder = (FetchRequests.LocalBinder) service;
                                    fetchRequests = localBinder.getService();
                                }

                                @Override
                                public void onServiceDisconnected(ComponentName name) {
                                    Log.d("ServiceConnector", "Disconnected");
                                    isConnected = false;
                                }
                            };
                            serviceIntent = new Intent(activity, FetchRequests.class);
                            serviceIntent.putExtra("Array", pending_invites);
                            serviceIntent.putExtra("UserId", id);
                            serviceIntent.putExtra("cloudinaryInitialization", cloudinaryInitialization);
                            startService(serviceIntent);
                            bindService(serviceIntent, serviceConnection, Context.BIND_AUTO_CREATE);
                            Log.d("Login", "Logged in successfully. Auth ok");
                        }
                    }
            });
        }
        else{
            Toast.makeText(context,"Please Check Internet Connection", Toast.LENGTH_SHORT).show();
            Log.e("Login","Internet Error!");
        }
    }

    @Override
    protected void onStart(){
        super.onStart();
        IntentFilter intentFilter = new IntentFilter();
        registerReceiver(broadcastReceiver,intentFilter);
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter("com.example.new_request"));
    }

    protected void onStop(){
        super.onStop();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(broadcastReceiver);
    }
    private void sendConnectionRequest(String qrcode,String id){
        User curr = app.currentUser();
        Functions func = curr.getFunctions();
        List<Object> args = Arrays.asList(qrcode,id,cloudinaryId);
        func.callFunctionAsync("sendRequest", args, Document.class, result1 -> {
                    if (result1.isSuccess()) {
                        Document details = result1.get();
                        String status = details.getString("status");
                        if (status.equals("Success"))  Log.d("sendRequestHandler", "Boom! you have done great");
                        else{
                            handler.post(
                                    new Runnable() {
                                        @Override
                                        public void run() {
                                            Toast.makeText(getApplicationContext(),"Some Error occurred",Toast.LENGTH_SHORT).show();
                                            Log.e("sendRequestHandler","Error in sending request");
                                        }
                                    }
                            );
                        }

                    } else{
                        handler.post(new Runnable() {
                            @Override
                            public void run() {
                                Log.e("sendRequestHandler", "Unexpected error");
                                Toast.makeText(getApplicationContext(),"check your connection!",Toast.LENGTH_SHORT).show();
                            }
                        });
                    }
                }
        );
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        SharedPreferences userMetaDetails = getSharedPreferences("UserMetaDetails", MODE_PRIVATE);
        boolean sessionSet = userMetaDetails.getBoolean("isSignedUp", false);
        if (!sessionSet) {
            Intent redirectToSignUp = new Intent(HomeScreenCumRedirectToSignUp.this, SignUp.class);
            startActivity(redirectToSignUp);
            finish();
        }
        password = userMetaDetails.getString("Password", "noPassword");
        id = userMetaDetails.getString("UserId", "notPresent");
        cloudinaryId = userMetaDetails.getString("Public_id","notPresent");
        broadcastReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Toast.makeText(context,"Got New Connections",Toast.LENGTH_SHORT).show();
                pending_invites=(ArrayList<ArrayList<String>>) intent.getExtras().get("PendingRequests");
                ArrayList<String> last = pending_invites.get(pending_invites.size()-1);
            }
        };
        BroadcastReceiver connectionListener = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (UserSignUpTools.isInternetAvailable(context) && status==0) performRealmLogin(context);
            }
        };
        registerReceiver(connectionListener,new IntentFilter("android.net.conn.CONNECTIVITY_CHANGE"));
        handler = new Handler(Looper.getMainLooper());
        status = 0;
        activity=this;
        Intent intent = getIntent();
        if (intent.getExtras()!=null)  cloudinaryInitialization = intent.getExtras().getBoolean("cloudinaryInitialization", false);
        else cloudinaryInitialization=false;
        Context context = getApplicationContext();
        String inviteId = userMetaDetails.getString("PendingInvites",null);
        String connectionIds = userMetaDetails.getString("Connections",null);
        Type type = new TypeToken<ArrayList<ArrayList<String>>>() {}.getType();
        pending_invites = new Gson().fromJson(inviteId,type);
        connections = new Gson().fromJson(connectionIds,type);
        qrCodeScanner = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    result -> {
                        if (result.getResultCode() == Activity.RESULT_OK) {
                            Bundle extras = result.getData().getExtras();
                            String qrcode = extras.getString("SCAN_RESULT");
                            if (status == 0) Toast.makeText(context,"You are not logged in!check your connection",Toast.LENGTH_SHORT).show();
                            else sendConnectionRequest(qrcode,id);
                        }
                    }
            );
            setContentView(R.layout.activity_home_screen_cum_redirect_to_sign_up);
            File qrfile = new File(getFilesDir(), "qrcode.png");
            Bitmap bmp = BitmapFactory.decodeFile(qrfile.getAbsolutePath());
            ImageView imageView = findViewById(R.id.imageview);
            if (bmp != null) imageView.setImageBitmap(bmp);
            File card = new File(getFilesDir(), "card.png");
            Bitmap bmpCard = BitmapFactory.decodeFile(card.getAbsolutePath());
            ImageView cardView = findViewById(R.id.cardview);
            if (bmpCard != null) cardView.setImageBitmap(bmpCard);
            Button scan = findViewById(R.id.scanQR);
            scan.setOnClickListener(v -> {
                qrCodeScanner.launch(new ScanContract().createIntent(getApplicationContext(), new ScanOptions()));
            });
            Button viewRequest = findViewById(R.id.viewRequests);
            viewRequest.setOnClickListener(
                    v->{
                        Intent newIntent = new Intent(getApplicationContext(),viewRequests.class);
                        startActivity(newIntent);
                    }
            );
            ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
                Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
                return insets;
            });
    }
}
class ImageManipulation{
    public static void manipulateImage(int resource,int x1,int y1,int x2,int y2,int bcr,int bcg,int bcb,int tcr,int tcg,int tcb,int size,Activity activity,String Text){
        Bitmap bitmap = BitmapFactory.decodeResource(activity.getApplicationContext().getResources(),resource);
        Bitmap mutableBitmap = bitmap.copy(Bitmap.Config.RGB_565,true);
        Canvas canvas = new Canvas(mutableBitmap);
        Paint rect = new Paint();
        rect.setColor(Color.rgb(bcr, bcg, bcb));
        rect.setStyle(Paint.Style.FILL);
        canvas.drawRect(new Rect(x1,y1,x2,y2),rect);
        Paint text =  new Paint();
        text.setColor(Color.rgb(tcr, tcg, tcb));
        text.setTextSize(size);
        text.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        Rect textRect = new Rect();
        text.getTextBounds(Text,0,Text.length(),textRect);
        int textHeight = textRect.height();
        int textWidth = textRect.width();
        float textX = x1 + ((float)x2 - x1 - textWidth) / 2;
        float textY = y1 + ((float)y2 - y1 + textHeight) / 2;
        canvas.drawText(Text, textX, textY, text);
        try {
            File directory = activity.getApplicationContext().getFilesDir();
            File outputFile = new File(directory, "card.png");
            FileOutputStream fileOutputStream = new FileOutputStream(outputFile);
            mutableBitmap.compress(Bitmap.CompressFormat.PNG,100,fileOutputStream);
            try {
                fileOutputStream.flush();
                fileOutputStream.close();
            }
            catch (IOException e){
                String err = e.getMessage();
                if (err!=null) Log.e("ImageManipulator",err);
            }
        }
        catch(FileNotFoundException e){
            String err = e.getMessage();
            if (err!=null) Log.e("ImageManipulation",err);
        }

    }
}