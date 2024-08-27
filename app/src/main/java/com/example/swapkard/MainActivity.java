package com.example.swapkard;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.view.Menu;
import android.widget.Toast;

import com.google.android.material.snackbar.Snackbar;
import com.google.android.material.navigation.NavigationView;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.appcompat.app.AppCompatActivity;

import com.example.swapkard.databinding.ActivityMainBinding;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;

import org.bson.Document;

import java.lang.reflect.Type;
import java.util.ArrayList;

import io.realm.Realm;
import io.realm.mongodb.App;
import io.realm.mongodb.AppConfiguration;
import io.realm.mongodb.Credentials;
import io.realm.mongodb.User;
public class MainActivity extends AppCompatActivity {

    private AppBarConfiguration mAppBarConfiguration;
    private ActivityMainBinding binding;

    private int status;
    private static String id;
    private String password;
    private static App app;

    private boolean isConnected;

    private static String lastPending;

    private ServiceConnection serviceConnection;

    private String cloudinaryId;

    private String thumbnailId;

    private FetchRequests fetchRequests;


    private Intent serviceIntent;

    private static ArrayList<Document> pending_invites;

    private static ArrayList<Document> connections;


    private Activity activity;

    private boolean cloudinaryInitialization;

    private static String lastConnection;

    private static int hasEventOccurred;


    private BroadcastReceiver broadcastReceiver;

    private BroadcastReceiver broadcastReceiver1;

    private BroadcastReceiver broadcastReceiver2;

    public void setEvent(){hasEventOccurred=1;}

    public void eventOver(){hasEventOccurred=0;}

    public static int getStatus(){return hasEventOccurred;}

    public static String getLastPending(){return lastPending;}

    public static String getLastConnection(){return lastConnection;}

    public static ArrayList<Document> getConnections(){ return connections;}

    public static ArrayList<Document> getPending_invites(){return pending_invites;}
    public static App getApp(){
        return app;
    }

    public String getCloudinary(){return cloudinaryId;}

    public String getThumbnail(){return thumbnailId;}

    public static String getId(){return id;}

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
                        serviceIntent.putExtra("UserId", id);
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
    protected void onStart(){
        super.onStart();
        IntentFilter intentFilter = new IntentFilter();
        registerReceiver(broadcastReceiver,intentFilter);
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter("com.example.new_request"));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver1,new IntentFilter("com.example.inviteAccepted"));
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver2,new IntentFilter("com.example.new_request_accepted"));
    }

    protected void onStop(){
        super.onStop();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(broadcastReceiver);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        setSupportActionBar(binding.appBarMain.toolbar);
        binding.appBarMain.fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null)
                        .setAnchorView(R.id.fab).show();
            }
        });
        DrawerLayout drawer = binding.drawerLayout;
        NavigationView navigationView = binding.navView;
        mAppBarConfiguration = new AppBarConfiguration.Builder(
                R.id.nav_home, R.id.nav_gallery, R.id.nav_slideshow)
                .setOpenableLayout(drawer)
                .build();
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_content_main);
        NavigationUI.setupActionBarWithNavController(this, navController, mAppBarConfiguration);
        NavigationUI.setupWithNavController(navigationView, navController);

        SharedPreferences userMetaDetails = getSharedPreferences("UserMetaDetails", MODE_PRIVATE);
        boolean sessionSet = userMetaDetails.getBoolean("isSignedUp", false);
        if (!sessionSet) {
            Intent redirectToSignUp = new Intent(MainActivity.this, SignUp.class);
            startActivity(redirectToSignUp);
            finish();
        }
        password = userMetaDetails.getString("Password", "noPassword");
        id = userMetaDetails.getString("UserId", "notPresent");
        cloudinaryId = userMetaDetails.getString("CloudinaryId","notPresent");
        thumbnailId = userMetaDetails.getString("ThumbnailId","notPresent");
        Log.d("DEBUG","ID = "+id);
        status = 0;
        activity=this;
        Intent intent = getIntent();
        if (intent.getExtras()!=null)  cloudinaryInitialization = intent.getExtras().getBoolean("cloudinaryInitialization", false);
        else cloudinaryInitialization=false;
        Context context = getApplicationContext();
        String inviteId = userMetaDetails.getString("PendingInvites",null);
        String connectionIds = userMetaDetails.getString("Connections",null);
        Type type = new TypeToken<ArrayList<Document>>() {}.getType();
        pending_invites = new Gson().fromJson(inviteId,type);
        if (pending_invites!=null && !pending_invites.isEmpty()) lastPending=pending_invites.get(pending_invites.size()-1).getString("senderId");
        else lastPending=null;
        connections = new Gson().fromJson(connectionIds,type);
        if (connections!=null && !connections.isEmpty()) lastConnection=connections.get(connections.size()-1).getString("senderId");
        else lastConnection=null;

        BroadcastReceiver connectionListener = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (UserSignUpTools.isInternetAvailable(context) && status==0) performRealmLogin(context);
            }
        };

        registerReceiver(connectionListener,new IntentFilter("android.net.conn.CONNECTIVITY_CHANGE"));

        broadcastReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Toast.makeText(context,"Got New Connections",Toast.LENGTH_SHORT).show();
                String pendingJson=intent.getExtras().getString("pendingArray");
                Type type = new TypeToken<ArrayList<Document>>(){}.getType();
                pending_invites=new Gson().fromJson(pendingJson,type);
                lastPending = pending_invites.get(pending_invites.size()-1).getString("senderId");
            }
        };


        broadcastReceiver1 = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String accepted = intent.getExtras().getString("senderId");
                for (int i=pending_invites.size()-1;i>=0;i--){
                    Document doc = pending_invites.get(i);
                    String senderId = doc.getString("senderId");
                    if (senderId.equals(accepted)){
                        pending_invites.remove(i);
                        connections.add(doc);
                        lastPending=pending_invites.get(pending_invites.size()-1).getString("senderId");
                        lastConnection=connections.get(connections.size()-1).getString("senderId");
                        eventOver();
                    }
                }
            }
        };

        broadcastReceiver2 = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Toast.makeText(context,"Got New Connections",Toast.LENGTH_SHORT).show();
                String pendingJson=intent.getExtras().getString("connectionArray");
                Type type = new TypeToken<ArrayList<Document>>(){}.getType();
                connections=new Gson().fromJson(pendingJson,type);
                lastConnection= connections.get(connections.size()-1).getString("senderId");
            }
        };

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    @Override
    public boolean onSupportNavigateUp() {
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_content_main);
        return NavigationUI.navigateUp(navController, mAppBarConfiguration) || super.onSupportNavigateUp();
    }

    protected void onDestroy(){
        SharedPreferences sharedPreferences = getSharedPreferences("UserMetaDetails",MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        String pendingJson = new Gson().toJson(pending_invites);
        editor.putString("PendingInvites",pendingJson);
        String connectionJson = new Gson().toJson(connections);
        editor.putString("Connections",connectionJson);
        editor.apply();
        super.onDestroy();
    }
}