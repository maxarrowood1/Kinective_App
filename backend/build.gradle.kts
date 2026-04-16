plugins {
    kotlin("jvm") version "1.9.23"
    kotlin("plugin.serialization") version "1.9.23"
    application
}

group = "com.addressbook"
version = "0.0.1"

application {
    mainClass.set("com.addressbook.ApplicationKt")
}

kotlin {
    jvmToolchain(17)
}

val ktorVersion = "2.3.10"
val exposedVersion = "0.49.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-cors:$ktorVersion")
    implementation("io.ktor:ktor-server-status-pages:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")

    implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-dao:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")
    implementation("org.xerial:sqlite-jdbc:3.45.3.0")

    implementation("ch.qos.logback:logback-classic:1.4.14")
}

tasks.jar {
    manifest {
        attributes("Main-Class" to "com.addressbook.ApplicationKt")
    }
}
