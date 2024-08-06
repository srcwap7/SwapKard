package com.example.swapkard;

import android.app.Service;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.drawable.Drawable;
import android.os.Binder;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;

import com.cloudinary.android.MediaManager;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;

import org.bson.Document;
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
    private ArrayList<ArrayList<String>> pending_invites;

    private ArrayList<Bitmap> invitees_card;

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
        List<String> args = Arrays.asList(id,last);
        if (UserSignUpTools.isInternetAvailable(getApplicationContext())) {
            functions.callFunctionAsync("ListenForConnections", args, Document.class, result -> {
                if (result.isSuccess()) {
                    Document doc = result.get();
                    String status = doc.getString("status");
                    Log.d("Listener","Listener On");
                    if (status.equals("Done")) {
                        ArrayList<Document> new_connections = (ArrayList<Document>)  doc.get("array");
                        if (new_connections!=null) {
                            if (new_connections.size()>0) Log.d("Receiver","Received New Connections");
                            for (int i = 0; i < new_connections.size(); i++) {
                                ArrayList<String> arrayList = new ArrayList<>();
                                arrayList.add(new_connections.get(i).getString("senderId"));
                                arrayList.add(new_connections.get(i).getString("senderCloudinaryId"));
                                String fileId = new_connections.get(i).getString("senderCloudinaryId");
                                String url = MediaManager.get().url().generate(fileId);
                                Picasso.get().load(url).into(
                                        new Target() {
                                            @Override
                                            public void onBitmapLoaded(Bitmap bitmap, Picasso.LoadedFrom from) {
                                                Log.d("BitmapLoader","Bitmap  Loaded");
                                                Intent broadcastIntent = new Intent("com.example.broadcast.NEW_REQUEST_GOT");
                                                broadcastIntent.setPackage(getPackageName());
                                                broadcastIntent.putExtra("bitmapArray",invitees_card);
                                                broadcastIntent.putExtra("pendingInvites",pending_invites);
                                                sendBroadcast(broadcastIntent);
                                                invitees_card.add(bitmap);
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
                                pending_invites.add(arrayList);
                            }
                            if (pending_invites.size()>0) last = pending_invites.get(pending_invites.size() - 1).get(0);
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
    @SuppressWarnings("unchecked")
    public int onStartCommand(Intent intent, int flags, int startId){
        Log.e("ServiceManager","Started");
        pending_invites=(ArrayList<ArrayList<String>>)intent.getExtras().get("Array");
        if (pending_invites.size()>0) last = pending_invites.get(pending_invites.size()-1).get(0);
        else last=null;
        invitees_card=(ArrayList<Bitmap>)intent.getExtras().get("BitmapArray");
        cloudinaryInitialization=intent.getExtras().getBoolean("cloudinaryInitialization");
        if (!cloudinaryInitialization) {
            Map<String, String> config = new HashMap<>();
            config.put("cloud_name", getString(R.string.CloudName));
            config.put("api_key", getString(R.string.APIKey));
            config.put("api_secret", getString(R.string.APISecret));
            MediaManager.init(getApplicationContext(), config);
        }
        id = (String) intent.getExtras().get("UserId");
        App app = HomeScreenCumRedirectToSignUp.getApp();
        User user = app.currentUser();
        functions = user.getFunctions();
        Log.d("AppUser",user.getId());
        last=null;
        Handler handler = new Handler();

        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                synchronize();
                Log.d("Looper","Running");
                Log.d("Last",last+"a");
                handler.postDelayed(this,5000);
            }
        };
        handler.post(runnable);
        return START_NOT_STICKY;
    }

}