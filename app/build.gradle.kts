plugins {
    alias(libs.plugins.android.application)
    id("com.google.gms.google-services")
    id("realm-android")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.kapt")
}

android {
    namespace = "com.example.swapkard"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.swapkard"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String","REALM_APP_ID","\"${System.getenv("REALM_APP_ID")}\"")
        buildConfigField("String","REALM_DATABASE","\"${System.getenv("MONGODB_USER_CRED_DATABASE")}\"")
        buildConfigField("String","REALM_COLLECTION","\"${System.getenv("MONGODB_USER_CRED_COLLECTION")}\"")
    }

    buildFeatures {
        buildConfig = true
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
    implementation(platform("com.google.firebase:firebase-bom:33.1.0"))
    implementation("com.google.firebase:firebase-analytics")
    implementation("com.google.firebase:firebase-auth")
    implementation ("io.realm:realm-gradle-plugin:10.10.1")
    implementation("com.google.zxing:core:3.4.1")
    implementation("com.journeyapps:zxing-android-embedded:4.3.0")
    implementation("net.glxn.qrgen.android:qrgen-android:2.6.0")
    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
}
