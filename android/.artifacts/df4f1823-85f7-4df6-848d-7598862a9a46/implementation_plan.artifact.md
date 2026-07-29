# Fix "Plugin with id 'com.android.application' not found" error

The root `build.gradle` file in the project has been incorrectly configured with application-level settings instead of root-level settings. This causes Gradle to fail because it cannot find the Android Gradle Plugin, as its classpath is not defined in a `buildscript` block.

## Proposed Changes

### Root Project

#### [MODIFY] [build.gradle](file:///C:/Users/ZOE/ipixchat/android/build.gradle)
- Replace the current application-level configuration with a standard top-level build script.
- Add the `buildscript` block with the necessary classpaths for `com.android.tools.build:gradle` and `com.google.gms:google-services`.
- Include `allprojects` block to define repositories for all modules.
- Add a `clean` task.

## Verification Plan

### Automated Tests
- Run `./gradlew help` or `./gradlew clean` to ensure the project structure is valid and the plugins are found.

### Manual Verification
- Perform a Gradle Sync in Android Studio to ensure the error disappears and the project syncs successfully.
