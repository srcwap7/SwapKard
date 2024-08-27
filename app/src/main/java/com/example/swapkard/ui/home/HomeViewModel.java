package com.example.swapkard.ui.home;

import android.app.Application;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import androidx.fragment.app.Fragment;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import java.io.File;
import java.io.FileOutputStream;

public class HomeViewModel extends AndroidViewModel {

    private final MutableLiveData<Bitmap> mBitmap;

    public HomeViewModel(Application application) {
        super(application);
        mBitmap = new MutableLiveData<>();
        File directory = getApplication().getFilesDir();
        File qrcodeFile = new File(directory,"qrcode.png");
        Bitmap bitmap = BitmapFactory.decodeFile(qrcodeFile.getAbsolutePath());
        mBitmap.setValue(bitmap);
    }

    public LiveData<Bitmap> getBitmap() {
        return mBitmap;
    }
}