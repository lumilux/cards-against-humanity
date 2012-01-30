//
//  LoginViewController.m
//  CardsAgainstHumanity
//
//  Created by Vivek Bhagwat on 1/29/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "LoginViewController.h"
#import "RoomViewController.h"
#import "SBJson.h"

@interface LoginViewController () <NSURLConnectionDelegate, NSURLConnectionDataDelegate>
@end

@implementation LoginViewController
@synthesize nameField;
@synthesize login;
@synthesize tap;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        self.nameField = [[UITextField alloc] init];
        self.login = [[UIButton alloc] init];
        // Custom initialization
    }
    return self;
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.tap = [[UITapGestureRecognizer alloc] initWithTarget:self
                                                                          action:@selector(dismissKeyboard)];
    
    [self.view addGestureRecognizer:self.tap];
    // Do any additional setup after loading the view from its nib.
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

- (IBAction) login: (id) sender
{
    login.enabled = NO;

    NSString *name = [nameField text];
//    NSMutableDictionary *user = [[NSMutableDictionary alloc] initWithObjects:[[NSArray alloc] initWithObjects:name, nil] forKeys:[[NSArray alloc] initWithObjects:@"name", nil]];
    NSMutableDictionary *user = [[NSMutableDictionary alloc] init];
    [user setObject:[[NSMutableDictionary alloc] init] forKey:@"user"];
    [[user objectForKey:@"user"] setObject:name forKey:@"name"];
    
    
    NSString *body = [user JSONRepresentation];
    
    NSMutableURLRequest *req = [[NSMutableURLRequest alloc] 
                                initWithURL:[[NSURL alloc] initWithString:@"http://radiant-moon-9602.herokuapp.com/users/new"]];
    
    [req setHTTPMethod:@"PUT"];
    [req setValue:@"application/json" forHTTPHeaderField:@"content-type"];
    [req setHTTPBody:[NSData dataWithBytes:[body UTF8String] length:[body length]]];
    
    NSURLConnection *con = [[NSURLConnection alloc] initWithRequest:req delegate:self];
    [con start];
}

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    NSLog(@"connection did receive response");
}


- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    NSLog(@"connection did receive data");
    NSLog([[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]);
    
    NSDictionary *rooms = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] JSONRepresentation];
    NSLog([rooms description]);
//    [self.navigationController pushViewController:[[RoomViewController alloc] initWithNibName:@"RoomViewController" bundle:nil] animated:YES];
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    NSLog(@"connection did finish loading");
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Connection Error"
                                                    message:@"Could not join room."
                                                   delegate:nil
                                          cancelButtonTitle:@"OK"
                                          otherButtonTitles:nil];
    // Display the alert to the user
    [alert show];
    [self.navigationController popViewControllerAnimated:NO];
    alert = nil;
}

-(void)dismissKeyboard {
    [nameField resignFirstResponder];
    [self.view removeGestureRecognizer:self.tap];
}

@end
