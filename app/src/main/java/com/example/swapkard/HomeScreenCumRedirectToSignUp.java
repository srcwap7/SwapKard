package com.example.swapkard;


import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;


public class HomeScreenCumRedirectToSignUp extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        SharedPreferences userMetaDetails = getSharedPreferences("UserMetaDetails",MODE_PRIVATE);
        boolean sessionSet = userMetaDetails.getBoolean("isSignedUp",false);
        if (!sessionSet){
            Intent redirectToSignUp = new Intent(HomeScreenCumRedirectToSignUp.this,SignUp.class);
            startActivity(redirectToSignUp);
            finish();
        }
        setContentView(R.layout.activity_home_screen_cum_redirect_to_sign_up);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}