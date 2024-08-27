package com.example.swapkard;

import static android.app.Activity.RESULT_OK;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Bundle;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;

import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;
import com.yalantis.ucrop.UCrop;

import java.io.File;
import java.util.HashMap;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link ProfilePicture#newInstance} factory method to
 * create an instance of this fragment.
 */
public class ProfilePicture extends Fragment {

    private static HashMap<String,String> mp;

    private static ActivityResultLauncher<Intent> activityResultLauncher;

    private static ActivityResultLauncher<Intent> ucropLauncher;

    public ProfilePicture() {
        // Required empty public constructor
    }

    public static ProfilePicture newInstance(HashMap<String,String> hashMap) {
        ProfilePicture fragment = new ProfilePicture();
        Bundle args = new Bundle();
        mp=hashMap;
        fragment.setArguments(args);
        return fragment;
    }

    private void startCrop(@NonNull Uri uri) {
        String destinationFileName = "userProfile.png";
        UCrop uCrop = UCrop.of(uri, Uri.fromFile(new File(getActivity().getFilesDir(), destinationFileName)));

        uCrop.withAspectRatio(1, 1);
        uCrop.withMaxResultSize(450, 450);

        ucropLauncher.launch(uCrop.getIntent(getActivity().getApplicationContext()));
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }


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

    private void applyCircularMask(Uri uri){
        ImageView imageView = getView().findViewById(R.id.uploadPhoto);
        Fragment fragment = this;
        Picasso.get().load(uri).into(new Target() {
            @Override
            public void onBitmapLoaded(Bitmap bitmap, Picasso.LoadedFrom from) {
                Bitmap modifiedBitmap = getCircularBitmap(bitmap);
                imageView.setImageBitmap(modifiedBitmap);
            }

            @Override
            public void onBitmapFailed(Exception e, Drawable errorDrawable) {
                Log.e("ProfilePicture","Loading Profile Picture Failed");
                UserSignUpTools.showAlert(fragment,"An Exception Occurred");
            }

            @Override
            public void onPrepareLoad(Drawable placeHolderDrawable) {

            }
        });
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View view=inflater.inflate(R.layout.fragment_profile_picture, container, false);
        Bitmap bitmap= BitmapFactory.decodeResource(getResources(),R.drawable.defaultprofile);
        Bitmap modifiedBitmap = getCircularBitmap(bitmap);
        ImageView imageView = view.findViewById(R.id.uploadPhoto);
        imageView.setImageBitmap(modifiedBitmap);
        ucropLauncher=registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result->{
                    if (result.getResultCode()==RESULT_OK) {
                        Intent data = result.getData();
                        Uri resultUri = UCrop.getOutput(data);
                        applyCircularMask(resultUri);
                    }
                }
        );
        activityResultLauncher=registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                new ActivityResultCallback<ActivityResult>() {
                    @Override
                    public void onActivityResult(ActivityResult o) {
                        Intent data = o.getData();
                        int resultCode = o.getResultCode();
                        if (resultCode==RESULT_OK && data !=null){
                            Uri uri = data.getData();
                            startCrop(uri);
                        }

                    }
                }
        );
        Intent pickImageIntent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        Button button = view.findViewById(R.id.uploadButton);
        button.setOnClickListener(v->{activityResultLauncher.launch(pickImageIntent);});
        Button proceed = view.findViewById(R.id.loadPasswordFragment);
        proceed.setOnClickListener(v->{
            FragmentTransaction fragmentTransaction = getActivity().getSupportFragmentManager().beginTransaction();
            fragmentTransaction.replace(R.id.fragment_username_prompt,passowrdFragment.newInstance(mp));
            fragmentTransaction.commit();
        });


        return view;
    }
}