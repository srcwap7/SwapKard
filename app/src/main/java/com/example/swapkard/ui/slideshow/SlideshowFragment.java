package com.example.swapkard.ui.slideshow;

import android.app.Dialog;
import android.content.Context;
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
import com.example.swapkard.R;
import com.example.swapkard.databinding.FragmentSlideshowBinding;
import java.io.File;

public class SlideshowFragment extends Fragment {

    private FragmentSlideshowBinding binding;

    private String id,last;

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

    private void loadConnections(String userName,File file,View root,String userId){
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
        acceptButton.setText(R.string.call);
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
        rejectButton.setText(R.string.Email);
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
                    File cardFile = new File(getActivity().getFilesDir(),"Connections");
                    File card = new File(cardFile,fileName);
                    Bitmap bitmap1 = BitmapFactory.decodeFile(card.getAbsolutePath());
                    imageView1.setImageBitmap(bitmap1);
                    dialog.show();
                }
            };
            Handler handler = new Handler(Looper.getMainLooper());
            handler.post(runnable);
        });

        LinearLayout mainWidget = root.findViewById(R.id.connectionLayout);
        mainWidget.addView(linearLayout);
    }

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        SlideshowViewModel slideshowViewModel =
                new ViewModelProvider(this).get(SlideshowViewModel.class);

        binding = FragmentSlideshowBinding.inflate(inflater, container, false);
        View root = binding.getRoot();
        File dir = new File(getActivity().getFilesDir(),"connections/ProfilePictures");
        File[] file = dir.listFiles();
        id = getActivity().getSharedPreferences("UserMetaDetails", Context.MODE_PRIVATE).getString("UserId","notPresent");
        SharedPreferences sharedPreferences = getActivity().getSharedPreferences("Mapping", Context.MODE_PRIVATE);
        if (file!=null){
            for (File files:file){
                String filename = files.getName();
                String userId = filename.substring(0,filename.length()-4);
                String userName = sharedPreferences.getString(userId,"notPresent");
                loadConnections(userName,files,root,userId);
                last=userId;
            }
        }
        return root;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}