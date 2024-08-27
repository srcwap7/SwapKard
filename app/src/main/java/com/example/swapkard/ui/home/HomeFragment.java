package com.example.swapkard.ui.home;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.example.swapkard.MainActivity;
import com.example.swapkard.R;
import com.example.swapkard.databinding.FragmentHomeBinding;
import com.journeyapps.barcodescanner.ScanContract;
import com.journeyapps.barcodescanner.ScanOptions;

import org.bson.Document;

import java.util.Arrays;
import java.util.List;

import io.realm.mongodb.App;
import io.realm.mongodb.User;
import io.realm.mongodb.functions.Functions;

public class HomeFragment extends Fragment {

    private FragmentHomeBinding binding;

    private ActivityResultLauncher<Intent> qrCodeScanner;

    private Context context;

    private App app;

    private void sendConnectionRequest(String qrcode,String id){
        User curr = app.currentUser();
        Functions func = curr.getFunctions();
        SharedPreferences userMetaDetails = getActivity().getSharedPreferences("UserMetaDetails",Context.MODE_PRIVATE);
        String userFirstName = userMetaDetails.getString("UserFirstName","notPresent");
        String userLastName = userMetaDetails.getString("UserLastName","notPresent");
        List<Object> args = Arrays.asList(qrcode,id,((MainActivity)getActivity()).getCloudinary(),userFirstName,userLastName,((MainActivity)getActivity()).getThumbnail());
        Handler handler = new Handler(Looper.getMainLooper());
        func.callFunctionAsync("sendRequest", args, Document.class, result1 -> {
                    if (result1.isSuccess()) {
                        Document details = result1.get();
                        String status = details.getString("status");
                        if (status.equals("Success"))  Log.d("sendRequestHandler", "Boom! you have done great");
                        else{
                            handler.post(
                                    new Runnable() {
                                        @Override
                                        public void run() {
                                            Toast.makeText(getActivity().getApplicationContext(),"Some Error occurred",Toast.LENGTH_SHORT).show();
                                            Log.e("sendRequestHandler","Error in sending request");
                                        }
                                    }
                            );
                        }

                    } else{
                        handler.post(new Runnable() {
                            @Override
                            public void run() {
                                Log.e("sendRequestHandler", "Unexpected error");
                                Toast.makeText(getActivity().getApplicationContext(),"check your connection!",Toast.LENGTH_SHORT).show();
                            }
                        });
                    }
                }
        );
    }

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        HomeViewModel homeViewModel = new ViewModelProvider(this).get(HomeViewModel.class);
        binding = FragmentHomeBinding.inflate(inflater, container, false);
        View root = binding.getRoot();
        final ImageView imageView = binding.qrcodeView;
        homeViewModel.getBitmap().observe(getViewLifecycleOwner(), imageView::setImageBitmap);
        context=getActivity().getApplicationContext();
        qrCodeScanner = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK) {
                        Bundle extras = result.getData().getExtras();
                        String qrcode = extras.getString("SCAN_RESULT");
                        app = MainActivity.getApp();
                        if (app == null) Toast.makeText(context,"You are not logged in!check your connection",Toast.LENGTH_SHORT).show();
                        else sendConnectionRequest(qrcode,((MainActivity)getActivity()).getId());
                    }
                }
        );
        return root;
    }

    public void onViewCreated(View view, Bundle savedInstanceState){
        super.onViewCreated(view, savedInstanceState);
        Button scan = view.findViewById(R.id.scanQR);
        scan.setOnClickListener(v -> {
            qrCodeScanner.launch(new ScanContract().createIntent(getActivity().getApplicationContext(), new ScanOptions()));
        });
    }
    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}