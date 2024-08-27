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
import android.widget.Toast;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.cloudinary.Cloudinary;
import com.cloudinary.android.MediaManager;
import com.google.gson.Gson;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;

import org.bson.Document;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.realm.mongodb.App;
import io.realm.mongodb.User;
import io.realm.mongodb.functions.Functions;

public class connectionListener extends Service {

    private Functions functions;

    private static ArrayList<Document> connections;

    private String id;

    private String lastId;
    private final IBinder binder = new LocalBinder();

    public class LocalBinder extends Binder {
        connectionListener getService() {return connectionListener.this;}
    }

    public connectionListener() {
    }

    @Override
    public IBinder onBind(Intent intent) {
        Log.d("connectionListenerBinder","Service Bound Successfully");
        return binder;
    }

    private void listenForConnections(){
        List<String> list = Arrays.asList(id,MainActivity.getLastConnection());
        if (MainActivity.getStatus()==0) {
            functions.callFunctionAsync("connectionListener", list, Document.class, result -> {
                if (result.isSuccess()) {
                    String status = result.get().getString("Status");
                    if (status.equals("Ok")) {
                        SharedPreferences sharedPreferences = getSharedPreferences("Mapping",MODE_PRIVATE);
                        SharedPreferences.Editor editor = sharedPreferences.edit();
                        ArrayList<Document> new_connections = (ArrayList<Document>) result.get().get("array");
                        if (new_connections != null && !new_connections.isEmpty()) {
                            if (!new_connections.isEmpty())
                                Log.d("Receiver", "Received New Connections");
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
                                                Log.d("BitmapLoader", "Bitmap  Loaded");
                                                String Filename = id + ".png";
                                                File file = new File(getFilesDir(), "connections");
                                                try {
                                                    FileOutputStream fileOutputStream = new FileOutputStream(new File(file, Filename));
                                                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream);
                                                } catch (Exception e) {
                                                    Log.e("IO Exception", "Failed To write Image " + e.getMessage());
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
                                            File directory = new File(getFilesDir(), "connections/ProfilePictures");
                                            FileOutputStream fileOutputStream = new FileOutputStream(new File(directory, FileName));
                                            bitmap.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream);
                                        } catch (Exception e) {
                                            Log.e("IO Exception", "Image Download error! " + e.getMessage());
                                        }
                                    }

                                    @Override
                                    public void onBitmapFailed(Exception e, Drawable errorDrawable) {

                                    }

                                    @Override
                                    public void onPrepareLoad(Drawable placeHolderDrawable) {

                                    }
                                });
                                editor.putString(id, userFirstName + userLastName);
                                editor.apply();
                            }
                            Intent intent = new Intent("com.example.new_request_accepted");
                            connections.addAll(new_connections);
                            intent.putExtra("connectionArray", new Gson().toJson(connections));
                            LocalBroadcastManager.getInstance(getApplicationContext()).sendBroadcast(intent);
                            if (!connections.isEmpty())
                                lastId = connections.get(connections.size() - 1).getString("senderId");
                        } else {
                            Toast.makeText(getApplicationContext(), "Request Failed!", Toast.LENGTH_SHORT).show();
                            Log.e("connectionAcceptedListener", "Failed to execute!" + ((Document) result.get().get("Error")).toString());
                        }
                    }
                }
            });
        }
    }

    public int onStartCommand(Intent intent,int flags,int startId){
        connections = MainActivity.getConnections();
        if (!connections.isEmpty()) lastId=connections.get(connections.size()-1).getString("senderId");
        else lastId=null;
        App app = MainActivity.getApp();
        User user = app.currentUser();
        id = MainActivity.getId();
        functions = user.getFunctions();
        try {Cloudinary cloudinary = MediaManager.get().getCloudinary();}
        catch(Exception e) {
            Map<String,String> config = new HashMap<>();
            config.put("cloud_name", getString(R.string.CloudName));
            config.put("api_key", getString(R.string.APIKey));
            config.put("api_secret", getString(R.string.APISecret));
            MediaManager.init(getApplicationContext(),config);
        }
        Handler handler = new Handler();
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                listenForConnections();
                Log.d("ConnectionLooper","Running");
                handler.postDelayed(this,5000);
            }
        };
        handler.post(runnable);
        return  START_NOT_STICKY;
    }
}