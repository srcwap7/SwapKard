package com.example.swapkard;

import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.drawable.Drawable;
import android.os.Binder;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.cloudinary.Cloudinary;
import com.cloudinary.android.MediaManager;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;

import org.bson.Document;

import java.io.File;
import java.io.FileOutputStream;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.realm.mongodb.App;
import io.realm.mongodb.User;
import io.realm.mongodb.functions.Functions;

public class FetchRequests extends Service {
    private final IBinder binder = new LocalBinder();
    private ArrayList<Document> pending_invites;

    private String id;
    private Functions functions;

    private boolean cloudinaryInitialization;

    private String last;

    public class LocalBinder extends Binder {
        FetchRequests getService() {
            return FetchRequests.this;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        Log.d("ServiceBinder","Service Bound Successfully");
        return binder;
    }

    public void synchronize(){
        if (UserSignUpTools.isInternetAvailable(getApplicationContext()) && MainActivity.getStatus()==0) {
            List<String> args = Arrays.asList(id,MainActivity.getLastPending());
            functions.callFunctionAsync("ListenForConnections", args, Document.class, result -> {
                if (result.isSuccess()) {
                    SharedPreferences sharedPreferences = getSharedPreferences("Mapping",MODE_PRIVATE);
                    SharedPreferences.Editor editor = sharedPreferences.edit();
                    Document doc = result.get();
                    String status = doc.getString("status");
                    Log.d("Listener","Listener On");
                    if (status.equals("Done")) {
                        ArrayList<Document> new_connections = (ArrayList<Document>) doc.get("array");
                        if (new_connections!=null && !new_connections.isEmpty()) {
                            if (!new_connections.isEmpty()) Log.d("Receiver","Received New Connections");
                            for (int i = 0; i < new_connections.size(); i++) {
                                String fileId = new_connections.get(i).getString("senderCloudinaryId");
                                String id = new_connections.get(i).getString("senderId");
                                String ThumbnailId = new_connections.get(i).getString("senderThumbnailId");
                                String userFirstName = new_connections.get(i).getString("userFirstName");
                                String userLastName = new_connections.get(i).getString("userLastName");
                                String url = MediaManager.get().url().generate(fileId);
                                Picasso.get().load(url).into(
                                        new Target() {
                                            @Override
                                            public void onBitmapLoaded(Bitmap bitmap, Picasso.LoadedFrom from) {
                                                Log.d("BitmapLoader","Bitmap  Loaded");
                                                String Filename = id + ".png";
                                                File file = new File(getFilesDir(),"pendingInvites");
                                                try {
                                                    FileOutputStream fileOutputStream = new FileOutputStream(new File(file, Filename));
                                                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream);
                                                }
                                                catch(Exception e){
                                                    Log.e("IO Exception","Failed To write Image "+e.getMessage());
                                                }
                                            }

                                            @Override
                                            public void onBitmapFailed(Exception e, Drawable errorDrawable) {
                                                Log.e("Picasso", "Image download failed");
                                            }

                                            @Override
                                            public void onPrepareLoad(Drawable placeHolderDrawable) {

                                            }
                                        }
                                );
                                String userThumbnail = MediaManager.get().url().generate(ThumbnailId);
                                Picasso.get().load(userThumbnail).into(new Target() {
                                    @Override
                                    public void onBitmapLoaded(Bitmap bitmap, Picasso.LoadedFrom from) {
                                        String FileName = id + ".png";
                                         try {
                                            File directory = new File(getFilesDir(), "pendingInvites/ProfilePictures");
                                            FileOutputStream fileOutputStream = new FileOutputStream(new File(directory, FileName));
                                            bitmap.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream);
                                        }
                                        catch(Exception e){
                                            Log.e("IO Exception","Image Download error! "+e.getMessage());
                                        }
                                    }
                                    @Override
                                    public void onBitmapFailed(Exception e, Drawable errorDrawable) {

                                    }

                                    @Override
                                    public void onPrepareLoad(Drawable placeHolderDrawable) {

                                    }
                                });
                                editor.putString(id,userFirstName+userLastName);
                                editor.apply();
                            }
                            Intent intent = new Intent("com.example.new_request");
                            pending_invites.addAll(new_connections);
                            intent.putExtra("pendingArray",new Gson().toJson(pending_invites));
                            LocalBroadcastManager.getInstance(getApplicationContext()).sendBroadcast(intent);
                            if (!pending_invites.isEmpty()) last = pending_invites.get(pending_invites.size() - 1).getString("senderId");
                        }
                    } else {
                        Log.e("Listener", doc.getString("error"));
                    }
                }
            });
        }
        else{
            Log.e("Internet Manager","No Internet Available!" );
        }
    }


    public int onStartCommand(Intent intent, int flags, int startId){
        Log.e("ServiceManager","Started");
        String pendingJson = intent.getExtras().getString("pendingArray");
        Type documentListType = new TypeToken<ArrayList<Document>>() {}.getType();
        pending_invites=MainActivity.getPending_invites();
        if (!pending_invites.isEmpty()) last=pending_invites.get(pending_invites.size()-1).getString("senderId");
        else last=null;
        Log.d("LastMessage","Last = " + last);
        try {
            Cloudinary cloudinary = MediaManager.get().getCloudinary();
            if (cloudinary != null) cloudinaryInitialization = true;
        }
        catch(Exception e) {
            Map<String,String> config = new HashMap<>();
            config.put("cloud_name", getString(R.string.CloudName));
            config.put("api_key", getString(R.string.APIKey));
            config.put("api_secret", getString(R.string.APISecret));
            MediaManager.init(getApplicationContext(),config);
        }
        id = (String) intent.getExtras().get("UserId");
        App app = MainActivity.getApp();
        User user = app.currentUser();
        functions = user.getFunctions();
        Handler handler = new Handler();
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                synchronize();
                Log.d("PendingLooper","Running");
                handler.postDelayed(this,4000);
            }
        };
        handler.post(runnable);
        return START_NOT_STICKY;
    }

}