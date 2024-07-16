package com.example.swapkard;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.journeyapps.barcodescanner.ScanContract;
import com.journeyapps.barcodescanner.ScanOptions;

import java.io.File;


public class HomeScreenCumRedirectToSignUp extends AppCompatActivity {

    private ActivityResultLauncher<Intent> qrCodeScanner;
    private void startQRScanner() {
        ScanOptions scOp = new ScanOptions();
        scOp.setOrientationLocked(true);
        qrCodeScanner.launch(new ScanContract().createIntent(getApplicationContext(),scOp));
    }
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
        qrCodeScanner = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result->{
                    if (result.getResultCode()==Activity.RESULT_OK){
                        if (result.getData()!=null){
                            Bundle extras = result.getData().getExtras();
                            String qrcode = extras.getString("SCAN_RESULT");
                            Log.d("QRScanner","Successful"+qrcode);
                        }
                        else{
                            AlertDialog.Builder dialogBox = new AlertDialog.Builder(this);
                            dialogBox.setTitle("All is not well");
                            dialogBox.setMessage("qr code not scanned successfully");
                            dialogBox.setPositiveButton("ok",(dialog,which)->{
                                dialog.dismiss();
                            });
                            dialogBox.show();
                        }
                    }
                }
        );
        setContentView(R.layout.activity_home_screen_cum_redirect_to_sign_up);
        File qrfile = new File(getFilesDir(),"qrcode.png");
        Bitmap bmp = BitmapFactory.decodeFile(qrfile.getAbsolutePath());
        ImageView imageView = findViewById(R.id.imageview);
        if (bmp != null)  imageView.setImageBitmap(bmp);
        Button scan = findViewById(R.id.scanQR);
        scan.setOnClickListener(v->startQRScanner());
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}