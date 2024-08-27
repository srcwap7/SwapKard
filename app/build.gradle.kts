plugins {
    alias(libs.plugins.android.application)
    id("com.google.gms.google-services")
    id("realm-android")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.kapt")
    id("com.chaquo.python")
}

android {
    namespace = "com.example.swapkard"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.swapkard"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String","REALM_APP_ID","\"${System.getenv("REALM_APP_ID")}\"")
        buildConfigField("String","REALM_DATABASE","\"${System.getenv("MONGODB_USER_CRED_DATABASE")}\"")
        buildConfigField("String","REALM_COLLECTION","\"${System.getenv("MONGODB_USER_CRED_COLLECTION")}\"")
        ndk {
            // On Apple silicon, you can omit x86_64.
            abiFilters += listOf("arm64-v8a", "x86_64")
        }
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }

    android {
        flavorDimensions += "pyVersion"
        productFlavors {
            create("py310") { dimension = "pyVersion" }
            create("py311") { dimension = "pyVersion" }
        }
    }
    chaquopy {
        productFlavors {
            getByName("py310") { version = "3.10" }
            getByName("py311") { version = "3.11" }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
}

realm{
    isSyncEnabled=true
}
dependencies {
    implementation(platform("com.google.firebase:firebase-bom:33.1.2"))
    implementation("com.google.firebase:firebase-analytics")
    implementation ("com.google.code.gson:gson:2.8.8")
    implementation ("com.squareup.picasso:picasso:2.71828")
    implementation("com.google.firebase:firebase-auth")
    implementation ("io.realm:realm-gradle-plugin:10.18.0")
    implementation("com.google.zxing:core:3.5.3")
    implementation("com.journeyapps:zxing-android-embedded:4.3.0")
    implementation ("com.cloudinary:cloudinary-android:1.29.0")
    implementation ("com.cloudinary:cloudinary-android:2.5.0")
    implementation ("com.cloudinary:cloudinary-android-download:2.5.0")
    implementation ("com.cloudinary:cloudinary-android-preprocess:2.5.0")
    implementation ("com.google.android.material:material:1.4.0")
    implementation ("com.google.android.material:material:1.10.0")
    implementation ("io.github.chaosleung:pinview:1.4.4")
    implementation(libs.lifecycle.livedata.ktx)
    implementation(libs.lifecycle.viewmodel.ktx)
    implementation(libs.navigation.fragment)
    implementation(libs.navigation.ui)
    val core_version = "1.13.1"
    implementation("androidx.core:core:$core_version")
    implementation("androidx.core:core-ktx:$core_version")
    implementation("androidx.core:core-role:1.0.0")
    implementation("androidx.core:core-animation:1.0.0")
    androidTestImplementation("androidx.core:core-animation-testing:1.0.0")
    implementation("androidx.core:core-performance:1.0.0")
    implementation("androidx.core:core-google-shortcuts:1.1.0")
    implementation("androidx.core:core-remoteviews:1.1.0")
    implementation("androidx.core:core-splashscreen:1.2.0-alpha01")
    implementation("com.github.yalantis:ucrop:2.2.8-native")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:1.8.0")
    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
}
