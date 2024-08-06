package com.example.swapkard;

import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.LinearLayout;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.util.ArrayList;

public class viewRequests extends AppCompatActivity {
    private static ArrayList<Bitmap> requestCards;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_view_requests);
        Intent intent = getIntent();
        requestCards = (ArrayList<Bitmap>) intent.getExtras().get("bitmapArray");
        LinearLayout linearLayout = findViewById(R.id.linearLayout);
        for (Bitmap bitmap : requestCards) {
            ImageView imageView = new ImageView(this);
            imageView.setImageBitmap(bitmap);

            // Set layout parameters for ImageView
            LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT);
            layoutParams.setMargins(0, 16, 0, 16); // Add some margins if needed
            imageView.setLayoutParams(layoutParams);

            // Add ImageView to LinearLayout
            linearLayout.addView(imageView);
        }
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}