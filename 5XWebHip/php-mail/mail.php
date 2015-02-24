<?php


/////////////////////////////////////////////////
// CONFIG
/////////////////////////////////////////////////

/**
 * to Addresses
 * You can send the Contact-Form-Data to more than one Address:
 *
 * $toAddresses = array(
 *      'email1@domain.com',
 *      'email2@domain.com',
 * );
 */
$toAddresses = array(
    'your-email@domain.com',
);

/**
 * Subject of the Contact-Mail
 *
 * Shortcode:
 * [username] will be replaced with the typed in name
 * [useremail] same with email
 */
$subject = "Contact request by [username]";

/**
 * From Name (not the Address)
 *
 * Shortcode
 * [username] will be replaced with the typed in name
 */
$from = '[username]';

/**
 * The From Address of the Contact-Mail
 *
 * Shortcode:
 * [useremail]
 *
 * WARNING:
 * If u use SMTP the $fromAddress should be the E-Mail of your SMTP Login
 */
$fromAddress = "[useremail]";

/**
 * Messages
 */
$messages = array(
    'success'               => 'Thanks for your request.',
    'error_name_empty'      => 'Your Name is required.',
    'error_email_empty'     => 'Your E-Mail is required.',
    'error_message_empty'   => 'Message is required.',
    'error_mail_send'       => 'Sorry! System Error. Please us our E-Mail: <a href=\'mailto:'.$toAddresses[0].'\'>'.$toAddresses[0].'</a>',
);

/**
 * SMTP
 *
 * WARNING; 
 * Not every server supports SMTP with PHP. Leave it inactive if you not sure.
 *
 * activate:    1 to activate SMTP, by 0 the other values don't matter
 * auth:        Login to the Server ( most servers require authentication for SMTP )
 * host:        your smtp host most times smtp.yourdomain.com or mail.yourdomain.com
 * username:    often your email address
 * password:    your password
 * port:        25 (default SMTP port)
 */
$smtp = array(
    'activate'  => 0,
    'auth'      => 1,
    'host'      => 'your-smtp-server (often smtp.yoursite.com)',
    'username'  => 'your-email-account-name (often your email address)',
    'password'  => 'your-email-password',
    'port'      => 25
);


/////////////////////////////////////////////////
// CONFIG END
/////////////////////////////////////////////////


$return = array();
$error = FALSE;

$FilePhpMailer      = dirname( __FILE__ ) . '/library/phpmailer.php';
$FilePhpMailerSmtp  = dirname( __FILE__ ) . '/library/phpmailer.smtp.php';
$FileTemplateHtml   = dirname( __FILE__ ) . '/template.html.php';
$FileTemplateText   = dirname( __FILE__ ) . '/template.text.php';

// Check PHPMailer File
if( !is_file( $FilePhpMailer ) )
    $error[] = 'Server Error: PHPMailer File not found.';

// Check PHPMailerSMTP File if SMTP active
if( ( $smtp['activate'] == 1) AND ( !is_file( $FilePhpMailerSmtp ) ) )
    $error[] = 'Server Error: PHPMailerSMTP File not found.';

// Check Layout Files
if( ( !is_file( $FileTemplateHtml ) ) OR ( !is_file( $FileTemplateText ) ) )
    $error[] = 'Server Error: Layout Files not Found';

// If no Server Errors
if( $error == FALSE ) {


    // Check Message
    if( empty( $_POST['message'] ))
    $error[]= $messages['error_message_empty'];

    // Check Email
    if( empty( $_POST['email'] ))
        $error[] = $messages['error_email_empty'];

    // Check Name
    if( empty( $_POST['name'] ) )
        $error[] = $messages['error_name_empty'];

}


// $error to $return['errorsMsg']
if( $error != FALSE ) {

    $return['errorMsg'] = '';

    foreach( $error as $msg ) {
        $return['errorMsg'] = $msg;
    }

}

// if no error
if( !isset( $return['errorMsg'] ) ) {

    require_once( $FilePhpMailer );

    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    $mail = new PHPMailer();

    $mail->IsHTML(true);
    $mail->CharSet  = 'UTF-8';

    // Subject
    $subject = str_replace( '[username]', $name, $subject );
    $subject = str_replace( '[useremail]', $email, $subject );

    $mail->Subject  = $subject;

    // From
    $from = str_replace( '[username]', $name, $from );
    $fromAddress = str_replace( '[useremail]', $email, $fromAddress );

    $mail->SetFrom( $fromAddress, $from );

    // Body
    $mail->Body = include( $FileTemplateHtml );
    $mail->AltBody = include( $FileTemplateText );

    // SMTP
    if( $smtp['activate'] == 1 ) {
    
    	$mail->pluginDir = dirname( __FILE__ ) . '/library/';

        $mail->IsSMTP();
        $mail->Host = $smtp['host'];
        $mail->Port = $smtp['port'];

        if( $smtp['auth'] == 1 ) {

            $mail->SMTPAuth = TRUE;
            $mail->Username = $smtp['username'];
            $mail->Password = $smtp['password'];

        }
    }

    // send Mail
    $one_email_success = 0;
    $email_send_error = 0;

	
    foreach( $toAddresses as $address ) {

        $mail->AddAddress( $address );

        if( $mail->Send() ) {

            $one_email_success = 1;
            $return['successMsg'] = $messages['success'];

        } else {
        	$return['errorMsg'] = 'Server Error. Could not send the message.';
        }

        $mail->ClearAddresses();
    }

    if( $one_email_success == 0 ) {
        $return['errorMsg'] = $messages['error_mail_send'];
    }

}

// feedback
echo json_encode( $return );


