import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ModalModule, BsDropdownModule } from 'ngx-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CallReceiverComponent } from './components/utility/call-receiver/call-receiver.component';
import { ReceiverModalComponent } from './components/utility/receiver-modal/receiver-modal.component';
import { ChatService } from './services/chat/chat.service';
import { WebsocketService } from './services/websocket/websocket.service';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    NotFoundComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    CallReceiverComponent,
    ReceiverModalComponent
  ],
  imports: [
    BrowserModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    AppRoutingModule
  ],
  entryComponents:[
    ReceiverModalComponent
  ],
  providers: [WebsocketService, ChatService,Title],
  bootstrap: [AppComponent]
})
export class AppModule { }
