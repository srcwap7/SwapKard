package com.example.swapkard.ui.gallery;

import android.app.Dialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.RectF;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.example.swapkard.MainActivity;
import com.example.swapkard.R;
import com.example.swapkard.databinding.FragmentGalleryBinding;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;

import org.bson.Document;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import io.realm.Realm;
import io.realm.mongodb.App;
import io.realm.mongodb.User;
import io.realm.mongodb.functions.Functions;

public class GalleryFragment extends Fragment {

    private FragmentGalleryBinding binding;

    private String last,id;

    private BroadcastReceiver broadcastReceiver;
    public Bitmap getCircularBitmap(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        Bitmap output = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(output);
        final Paint paint = new Paint();
        final Rect rect = new Rect(0, 0, width, height);
        final RectF rectF = new RectF(rect);
        final float radius = Math.min(width, height) / 2f;

        paint.setAntiAlias(true);
        paint.setColor(Color.RED);
        canvas.drawARGB(0, 0, 0, 0);
        canvas.drawCircle(width / 2f, height / 2f, radius, paint);
        paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_IN));
        canvas.drawBitmap(bitmap, rect, rectF, paint);

        return output;
    }



    private void createWidget(String userName, File file,View root,String userId){
        LinearLayout linearLayout = new LinearLayout(getActivity().getApplicationContext());
        linearLayout.setOrientation(LinearLayout.VERTICAL);
        linearLayout.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        ));

        ConstraintLayout constraintLayoutA = new ConstraintLayout(getActivity().getApplicationContext());
        constraintLayoutA.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        ));

        ImageView imageView = new ImageView(getActivity().getApplicationContext());
        Bitmap bitmap = BitmapFactory.decodeFile(file.getAbsolutePath());
        imageView.setImageBitmap(getCircularBitmap(bitmap));

        ConstraintLayout.LayoutParams imageParams = new ConstraintLayout.LayoutParams(
                ConstraintLayout.LayoutParams.WRAP_CONTENT,
                ConstraintLayout.LayoutParams.WRAP_CONTENT);

        imageParams.leftToLeft = ConstraintLayout.LayoutParams.PARENT_ID;
        imageParams.topToTop = ConstraintLayout.LayoutParams.PARENT_ID;
        imageParams.bottomToBottom = ConstraintLayout.LayoutParams.PARENT_ID;


        int dpValue = 100; // Example dp value
        float density = getResources().getDisplayMetrics().density;
        imageParams.width = (int) (dpValue * density);
        dpValue = 70;
        imageParams.height = (int) (dpValue * density);

        imageView.setLayoutParams(imageParams);
        constraintLayoutA.addView(imageView);

        TextView textView = new TextView(getActivity().getApplicationContext());
        ConstraintLayout.LayoutParams textParams = new ConstraintLayout.LayoutParams(
                ConstraintLayout.LayoutParams.WRAP_CONTENT,
                ConstraintLayout.LayoutParams.WRAP_CONTENT);
        textParams.rightToRight = ConstraintLayout.LayoutParams.PARENT_ID;
        textParams.topToTop = ConstraintLayout.LayoutParams.PARENT_ID;
        textParams.bottomToBottom = ConstraintLayout.LayoutParams.PARENT_ID;
        textView.setLayoutParams(textParams);
        textView.setText(userName);
        constraintLayoutA.addView(textView);

        ConstraintLayout constraintLayoutB = new ConstraintLayout(getActivity().getApplicationContext());
        constraintLayoutB.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        ));

        Button acceptButton = new Button(getActivity().getApplicationContext());
        acceptButton.setText(R.string.Accept);
        ConstraintLayout.LayoutParams buttonParam = new ConstraintLayout.LayoutParams(
                ConstraintLayout.LayoutParams.WRAP_CONTENT,
                ConstraintLayout.LayoutParams.WRAP_CONTENT
        );
        buttonParam.leftToLeft = ConstraintLayout.LayoutParams.PARENT_ID;
        buttonParam.topToTop = ConstraintLayout.LayoutParams.PARENT_ID;
        buttonParam.bottomToBottom = ConstraintLayout.LayoutParams.PARENT_ID;
        acceptButton.setLayoutParams(buttonParam);

        acceptButton.setOnClickListener(v->{
            Toast.makeText(getActivity().getApplicationContext(),"You clicked Me!",Toast.LENGTH_SHORT).show();
        });


        Button rejectButton = new Button(getActivity().getApplicationContext());
        rejectButton.setText(R.string.Reject);
        ConstraintLayout.LayoutParams buttonParam2 = new ConstraintLayout.LayoutParams(
                ConstraintLayout.LayoutParams.WRAP_CONTENT,
                ConstraintLayout.LayoutParams.WRAP_CONTENT
        );
        buttonParam2.rightToRight = ConstraintLayout.LayoutParams.PARENT_ID;
        buttonParam2.topToTop = ConstraintLayout.LayoutParams.PARENT_ID;
        buttonParam2.bottomToBottom = ConstraintLayout.LayoutParams.PARENT_ID;
        rejectButton.setLayoutParams(buttonParam2);

        constraintLayoutB.addView(acceptButton);
        constraintLayoutB.addView(rejectButton);

        linearLayout.addView(constraintLayoutA);
        linearLayout.addView(constraintLayoutB);

        linearLayout.setOnClickListener(v->{
            Runnable runnable = new Runnable() {
                @Override
                public void run() {
                    Dialog dialog = new Dialog(getActivity());
                    dialog.setContentView(R.layout.card_preview);
                    ImageView imageView1 = dialog.findViewById(R.id.dialog_image_view);
                    String fileName = userId + ".png";
                    File cardFile = new File(getActivity().getFilesDir(),"pendingInvites");
                    File card = new File(cardFile,fileName);
                    Bitmap bitmap1 = BitmapFactory.decodeFile(card.getAbsolutePath());
                    imageView1.setImageBitmap(bitmap1);
                    dialog.show();
                }
            };
            Handler handler = new Handler(Looper.getMainLooper());
            handler.post(runnable);
        });

        LinearLayout mainWidget = root.findViewById(R.id.mainWidget);

        acceptButton.setOnClickListener(v->{
            App app = ((MainActivity)getActivity()).getApp();
            User user = app.currentUser();
            Functions functions = user.getFunctions();
            List<String> list = Arrays.asList(id,userId);
            ((MainActivity)getActivity()).setEvent();
            Log.d("Parameters","Parameters are " + list.get(0) + " " + list.get(1));
            functions.callFunctionAsync("approveRequest",list, Document.class,result -> {
                if (result.isSuccess()){
                    String status = result.get().getString("Status");
                    if (status.equals("Ok")){
                        Log.d("ConnectionAcceptHandler","Connection Accepted");
                        String cardFileName = userId + ".png";
                        mainWidget.removeView(linearLayout);
                        try {
                            File cardDirectory = new File(getActivity().getFilesDir(), "pendingInvites");
                            File cardPic = new File(cardDirectory, cardFileName);
                            File profileDirectory = new File(cardDirectory, "ProfilePictures");
                            File profile = new File(profileDirectory, cardFileName);
                            File destinationCardDirectory = new File(getActivity().getFilesDir(), "connections");
                            File destinationCardFile = new File(destinationCardDirectory, cardFileName);
                            File destinationProfileDirectory = new File(destinationCardDirectory, "ProfilePictures");
                            File destinationProfile = new File(destinationProfileDirectory, cardFileName);
                            Path sourceCardPath = Paths.get(cardPic.toURI());
                            Path targetCardPath = Paths.get(destinationCardFile.toURI());
                            Files.move(sourceCardPath, targetCardPath);
                            Path sourceProfilePath = Paths.get(profile.toURI());
                            Path targetProfilePath = Paths.get(destinationProfile.toURI());
                            Files.move(sourceProfilePath, targetProfilePath);
                            Intent intent = new Intent("com.example.inviteAccepted");
                            intent.putExtra("senderId", userId);
                            LocalBroadcastManager.getInstance(requireContext()).sendBroadcast(intent);
                            Log.d("HandlingConnectionAccepted","Updated,All Good!");
                        }
                        catch(IOException e){
                            Log.e("IOError","Failed to update directories");
                        }
                    }
                    else{
                        Toast.makeText(requireContext(),"Error in executing request",Toast.LENGTH_SHORT).show();
                        Log.e("HandlingConnectionAcceptedMONGODB","Error in accepting request " + (result.get().get("Error")).toString());
                    }
                }
                else{
                    Toast.makeText(requireContext(),"Due to some error we could not handle request",Toast.LENGTH_SHORT).show();
                    Log.e("HandlingConnectionAccepted","Some Error occurred "+(result.get().get("Error")).toString());
                }
            });
        });


        mainWidget.addView(linearLayout);
    }

    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        Realm.init(requireContext());
        GalleryViewModel galleryViewModel = new ViewModelProvider(this).get(GalleryViewModel.class);
        binding = FragmentGalleryBinding.inflate(inflater, container, false);
        View root = binding.getRoot();
        Fragment fragment = this;
        id = getActivity().getSharedPreferences("UserMetaDetails",Context.MODE_PRIVATE).getString("UserId","notPresent");
        SharedPreferences sharedPreferences = getActivity().getSharedPreferences("Mapping", Context.MODE_PRIVATE);
        broadcastReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.d("connectionReceiver","New Connection Got");
                File pendingRequest = new File(fragment.getActivity().getFilesDir(),"pendingInvites/ProfilePictures");
                String pending = (String) intent.getExtras().get("pendingArray");
                Type type = new TypeToken<ArrayList<Document>>() {}.getType();
                ArrayList<Document> pendingArray = new Gson().fromJson(pending,type);
                for (int i=pendingArray.size()-1;i>=0;i--){
                    String userId=pendingArray.get(i).getString("senderId");
                    if (userId.equals(last)){
                        last=pendingArray.get(pendingArray.size()-1).getString("senderId");
                        break;
                    }
                    String fileName=userId+".png";
                    File file=new File(pendingRequest,fileName);
                    String userName = sharedPreferences.getString(userId,"notPresent");
                    createWidget(userName,file,root,userId);
                }

            }
        };
        LocalBroadcastManager.getInstance(requireContext()).registerReceiver(broadcastReceiver,new IntentFilter("com.example.new_request"));
        File dir = new File(getActivity().getFilesDir(),"pendingInvites/ProfilePictures");
        File[] file = dir.listFiles();
        if (file!=null){
            for (File files:file){
                String filename = files.getName();
                String userId = filename.substring(0,filename.length()-4);
                String userName = sharedPreferences.getString(userId,"notPresent");
                createWidget(userName,files,root,userId);
                last=userId;
            }
        }

        return root;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        LocalBroadcastManager.getInstance(requireContext()).unregisterReceiver(broadcastReceiver);
        binding = null;
    }
}