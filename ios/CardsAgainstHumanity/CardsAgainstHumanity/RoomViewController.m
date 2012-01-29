//
//  RoomViewController.m
//  CardsAgainstHumanity
//
//  Created by Vivek Bhagwat on 1/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "RoomViewController.h"
#import "CardsViewController.h"

@interface RoomViewController () <NSURLConnectionDelegate, NSURLConnectionDataDelegate>
@end

@implementation RoomViewController

@synthesize roomList;
@synthesize cardsController;

- (id)initWithStyle:(UITableViewStyle)style
{
    self = [super initWithStyle:style];
    if (self) {
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
    
    
    //download room info, parse and sort into objects
    
    self.roomList = [[NSArray alloc] initWithObjects:@"Room 1", @"Room 2", nil];
    self.title = @"Rooms";
    
    // Uncomment the following line to preserve selection between presentations.
    // self.clearsSelectionOnViewWillAppear = NO;
    
    // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
    // self.navigationItem.rightBarButtonItem = self.editButtonItem;
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    self.roomList = nil;
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
}

- (void)viewDidDisappear:(BOOL)animated
{
    [super viewDidDisappear:animated];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    //#warning Potentially incomplete method implementation.
    // Return the number of sections.
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    //#warning Incomplete method implementation.
    // Return the number of rows in the section.
    return [self.roomList count];
}


- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView 
                             dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] 
                initWithStyle:UITableViewCellStyleDefault
                reuseIdentifier:CellIdentifier];
    }
    // Configure the cell.
    cell.textLabel.text = 
    [self.roomList objectAtIndex: 
     [indexPath row]];
    return cell;
}

/*
 // Override to support conditional editing of the table view.
 - (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
 {
 // Return NO if you do not want the specified item to be editable.
 return YES;
 }
 */

/*
 // Override to support editing the table view.
 - (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
 {
 if (editingStyle == UITableViewCellEditingStyleDelete) {
 // Delete the row from the data source
 [tableView deleteRowsAtIndexPaths:[NSArray arrayWithObject:indexPath] withRowAnimation:UITableViewRowAnimationFade];
 }   
 else if (editingStyle == UITableViewCellEditingStyleInsert) {
 // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
 }   
 }
 */

/*
 // Override to support rearranging the table view.
 - (void)tableView:(UITableView *)tableView moveRowAtIndexPath:(NSIndexPath *)fromIndexPath toIndexPath:(NSIndexPath *)toIndexPath
 {
 }
 */

/*
 // Override to support conditional rearranging of the table view.
 - (BOOL)tableView:(UITableView *)tableView canMoveRowAtIndexPath:(NSIndexPath *)indexPath
 {
 // Return NO if you do not want the item to be re-orderable.
 return YES;
 }
 */

#pragma mark - Table view delegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    /*
     <#DetailViewController#> *detailViewController = 
     [[<#DetailViewController#> alloc] 
     initWithNibName:@"<#Nib name#>" 
     bundle:nil];
     // ...
     // Pass the selected object to the new view controller.
     
     [self.navigationController 
     pushViewController:detailViewController 
     animated:YES];
     [detailViewController release];
     */
    
    NSMutableURLRequest *req = [[NSMutableURLRequest alloc] 
                         initWithURL:[[NSURL alloc] initWithString:@"http://localhost/"]];
    
    [req setHTTPMethod:@"GET"];
    
    NSURLConnection *con = [[NSURLConnection alloc] initWithRequest:req delegate:self];
    [con start];
//    [self.navigationController pushViewController:self.cardsController animated:YES];
    
    
//    self.cardsController.title = [[roomList objectAtIndex:indexPath.row] description];
}

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    NSLog(@"connection did receive response");
    NSLog([response description]);
}


- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
     NSLog(@"connection did receive data");
    NSLog([data description]);
    
    NSString *str = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    NSLog(str);
    
    if(YES || str == @"<html><body><h1>It works!</h1></body></html>") //room joined successfully
    {
        self.cardsController = [[CardsViewController alloc] initWithNibName:@"CardsViewController" bundle:nil];
        [self.navigationController pushViewController:self.cardsController animated:YES];
    }
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    NSLog(@"connection did finish loading");
    NSLog([connection description]);
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




@end
