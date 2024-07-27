package com.example.swapkard;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

public class updateUIRequests extends Service {
    public updateUIRequests() {
    }

    @Override
    public IBinder onBind(Intent intent) {
        // TODO: Return the communication channel to the service.
        throw new UnsupportedOperationException("Not yet implemented");
    }
}